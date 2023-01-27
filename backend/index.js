const express = require("express");
const cors = require("cors");
const Platform = require("@roq/nodejs").Platform;
const bcrypt = require("bcrypt");
const PrismaClient = require("@prisma/client").PrismaClient;
const uuid = require("uuid").v4;

const prisma = new PrismaClient();

const roqClient = new Platform({
  host: process.env.ROQ_PLATFORM_URL,
  environmentId: process.env.ROQ_ENV_ID,
  apiKey: process.env.ROQ_API_KEY,
});

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/auth/login", async (req, res) => {
  if (!req.body) {
    res.status(400).json({ error: "Body not specified" });
    return;
  }

  const { email, password } = req.body;

  try {
    const user = await prisma.user.findFirst({
      where: { email },
    });

    if (!(await bcrypt.compare(password, user?.password))) {
      res.status(401).json({ error: "The email address or password is incorrect." });
      return;
    }

    const roqAccessToken = await roqClient.authorization.createUserToken(user.roqUserId);

    user.roqAccessToken = roqAccessToken;

    return res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

app.post("/auth/register", async (req, res) => {
  if (!req.body) {
    res.status(400).json({ error: "Body not specified" });
    return;
  }
  const { name, email, password } = req.body;

  // STEP 1 - Sync the user to ROQ
  //the user reference (a reference to your user on ROQ - usually a userId or unique identifier) is required while creating the user on ROQ
  const userId = uuid();
  const roqUser = await roqClient.asSuperAdmin().createUser({
    user: {
      reference: userId,
      email,
      firstName: name,
      isOptedIn: true,
      active: true,
    },
  });

  const roqUserId = roqUser?.createUser?.id;
  if (!roqUserId) {
    throw new Error("Could not register on ROQ");
  }

  // STEP 2 - Create the user on the database
  try {
    let user = await prisma.user.create({
      data: {
        name,
        email,
        password: bcrypt.hashSync(password, 10),
        roqUserId,
      },
    });

    // Optional - Notify the user with a "welcome" in-app notification
    roqClient.asSuperAdmin().notify({
      notification: {
        key: "welcome",
        recipients: { userIds: [roqUserId] },
      },
    });

    // Remove the password before returning the user info
    delete user.password;

    const roqAccessToken = await roqClient.authorization.createUserToken(user.roqUserId);

    user.roqAccessToken = roqAccessToken;

    return res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

app.post("/files/uploaded", async (req, res) => {
  if (!req.body) {
    res.status(400).json({ error: "Body not specified" });
    return;
  }

  const { limit = 5, userId: id } = req.body;
  const user = await prisma.user.findFirst({
    where: { id },
  });

  const roqUserId = user.roqUserId;
  if (!roqUserId) {
    throw new Error("Could not connect to  ROQ");
  }

  const { files: result } = roqClient.asUser(roqUserId).files({
    limit,
    filter: {
      createdByUserId: {
        equalTo: roqUserId,
      },
    },
  });

  const totalCount = result.totalCount;
  const data = result.data.map(({ id, createdAt, name, url }) => ({
    id,
    createdAt,
    name,
    url,
  }));

  res.status(200).json({
    data,
    totalCount,
  });
});
