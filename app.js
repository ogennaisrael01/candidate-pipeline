// project entry point

import express from "express";
import { packageRoutes } from "./routes_controllers.js";

const app = express();

const startServer = async () => {
    const port = process.env.PORT_NAME || "3000"
    const host = process.env.HOST_NAME || "127.0.0.1"

    app.listen( port, host, () => {
        console.log(`Server Runninig on: http(s)://${host}:${port}/`)
    })

}
app.use(express.json());
packageRoutes(app);
startServer();
