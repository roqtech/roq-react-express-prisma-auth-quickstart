import React, { useCallback, useEffect, useState } from "react";
import { useRoqFileUploader, FileUpload } from "@roq/ui-react";

function Files(props) {
  const { userId } = props;
  const [file, setFile] = useState();
  const [fileUrl, setFileUrl] = useState();
  const [files, setFiles] = useState([]);

  // To control the file upload - i.e trigger the upload when required,
  // you can use this hook to get the fileUploader object
  const fileUploader = useRoqFileUploader({
    onUploadSuccess: async (file) => {
      const result = await fetch(process.env.REACT_APP_BACKEND_URL + "/files/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          fileId: file.id,
        }),
      });

      const data = await result.json();

      if (data.file) {
        setFile(file);

        setFiles((fileList) => [
          {
            id: data.file.id,
            name: file.name,
            url: file.url,
          },
          ...fileList,
        ]);
      } else {
        throw new Error("Upload error");
      }
    },
    onUploadFail: (file) => {
      setFile(undefined);
    },
    onChange: ([file]) => {
      setFile(file);
    },
    fileCategory: "USER_FILES",
  });

  // Trigger the upload manually, by calling the uploadFile function
  const handleUpload = useCallback(async () => {
    const { url } = await fileUploader.uploadFile({
      file: file,
      temporaryId: file.name,
    });

    setFileUrl(url);
  }, [fileUploader]);

  useEffect(() => {
    let isMount = true;

    if (isMount) {
      const fetchFiles = async () => {
        const result = await fetch(process.env.REACT_APP_BACKEND_URL + "/files", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        const { data: fileList } = await result.json();
        setFiles(fileList);
      };

      fetchFiles();
    }

    return () => {
      isMount = false;
    };
  }, []);

  return (
    <>
      <h1>File uploads</h1>
      <h3>Here&apos;s an example of a controlled file upload</h3>

      <div>
        {/* Display the uploader button */}
        <FileUpload fileUploader={fileUploader} accept={["image/*"]} fileCategory="USER_FILES" />

        {/* Images can be previewed using the previews property of the file uploader object */}
        <img width={"100%"} src={fileUploader.previews?.[0]?.url} />

        {file ? (
          <button onClick={handleUpload} className="button">
            Upload File
          </button>
        ) : (
          <></>
        )}

        {fileUrl ? (
          <div>
            Your file is uploaded, and accessible from this S3 URL:
            <a href={fileUrl} target="_blank">
              {fileUrl}
            </a>
          </div>
        ) : (
          <></>
        )}
      </div>

      <h3>My files</h3>

      <ol>
        {files.map(({ id, name, url }) => (
          <li key={id}>
            <a href={url} target="_blank">
              {name}
            </a>
          </li>
        ))}
      </ol>
    </>
  );
}

export default Files;
