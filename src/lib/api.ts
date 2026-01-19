export const apiFetch = async (endpoint: string) => {
  const res = await fetch(endpoint, {
    credentials: 'include', 
  });

  if (res.status === 401) {
    throw new Error("Unauthorized");
  }

  if (!res.ok) throw new Error("Network response was not ok");
  
  return res.json();
};