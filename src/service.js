
const END_POINT = "https://api.thunder.softoo.co/vis/api/dashboard/ssu/fixed";

export const fetchData = async () => {
  try {
    return  await fetch(END_POINT)
      .then((response) => response.json())
      .then((data) => {
        return data.data
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  } catch (error) {
    console.log(error);
  }
};