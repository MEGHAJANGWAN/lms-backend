
import app from "./app.js";
import connectionToDB from "./config/dbConnection.js";
// ye jo .env file ke andr configuration hai usko consider krta hai uske basis pr cheezo ko execute krta hai

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
    await connectionToDB();
    console.log(`App is running at http://localhost:${PORT}`)
})