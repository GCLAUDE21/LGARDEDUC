import { useState } from "react";

const useUpload = (folder = "misc") => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [uploading, setUploading] = useState(false);

  const upload = async (file) => {
    if (!file) return null;
    const formData = new FormData();
    formData.append("image", file);
    setUploading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/upload?folder=${folder}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.url;
    } catch (err) {
      console.log(err);
      return null;
    } finally {
      setUploading(false);
    }
  };

  return { upload, uploading };
};

export default useUpload;
