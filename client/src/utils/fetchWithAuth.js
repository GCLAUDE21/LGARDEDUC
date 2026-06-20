const fetchWithAuth = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    credentials: "include", // envoie les cookies automatiquement
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (response.status === 401) {
    window.location.href = "/auth";
    return null;
  }

  return response;
};

export default fetchWithAuth;
