import React, { useCallback, useState } from "react";
import { useRoqFileUploader, FileUpload } from "@roq/ui-react";

function Files(props) {
  const [file, setFile] = useState();
  const [fileUrl, setFileUrl] = useState();

  // To control the file upload - i.e trigger the upload when required,
  // you can use this hook to get the fileUploader object
  const fileUploader = useRoqFileUploader({
    onUploadSuccess: (file) => {
      setFile(file);
    },
    onUploadFail: (file) => {
      debugger;
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

      {/* <FileList /> */}
    </>
  );
}

export default Files;
