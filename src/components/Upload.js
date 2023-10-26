import { Upload } from "antd";
import { useMutation } from "@apollo/client";

import { UPLOAD_FILE, DELETE_FILE } from "../gqls/upload";
import { useEffect, useMemo, useState } from "react";

const UploadFile = ({ name, children, onChange, value }) => {
  const [file, setFile] = useState(null);

  useEffect(() => {
    if (value) {
      setFile({
        uid: "-1",
        name: value,
        status: "done",
        url: "/uploads/" + value,
      });
    } else {
    }
  }, [value]);

  const [uploadFile] = useMutation(UPLOAD_FILE, {
    onCompleted: ({ uploadFile }) => {
      onChange(uploadFile);
    },
    onError: () => {
      setFile({
        ...file,
        status: "error",
      });
      onChange(null);
    },
  });

  const [deleteFile] = useMutation(DELETE_FILE, {
    onCompleted: () => {
      setFile(null);
      onChange(null);
    },
    onError: () => {
      setFile(null);
      onChange(null);
    },
  });

  const beforeUploadLogo = (file) => {
    setFile({
      uid: "-1",
      name: file.name,
      status: "uploading",
    });
    uploadFile({
      variables: { file },
    });
    return false;
  };

  const onRemove = (file) => {
    if (file.status === "done") {
      setFile({
        ...file,
        status: "uploading",
      });
      deleteFile({
        variables: { fileName: value },
      });
    } else {
      setFile(null);
      onChange(null);
    }
  };

  const fileList = useMemo(() => (file ? [file] : []), [file]);

  return (
    <Upload
      fileList={fileList}
      name={name}
      showUploadList={{
        showPreviewIcon: false,
        showRemoveIcon: true,
      }}
      listType="picture-card"
      beforeUpload={beforeUploadLogo}
      multiple={false}
      maxCount={1}
      onRemove={onRemove}
    >
      {!value && children}
    </Upload>
  );
};

export default UploadFile;
