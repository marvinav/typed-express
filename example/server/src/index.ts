import express, { json } from "express";
import { fillRouteWithEndpoints } from "@marvinav/typed-express";

const app = express();
app.use(json());

