import { Response } from "express";
import { db } from "../config/db.config.js";
import { JwtTokenPayload, User } from "../types/user.types.js";
import { AuthRequest } from "../types/auth.type.js";
//import { CountRow } from "../types/global.types.js";
//import { deriveTrend, getPreviousDateRange } from "../utilities/index.js";
//import { RowDataPacket } from "mysql2";

export const getUserInfo = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.user_id;

    const [rows] = await db.query("SELECT * FROM users WHERE user_id = ? LIMIT 1", [userId]);
    const user = (rows as User[])[0];

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return userdata JSON
    return res.status(200).json({ status: 200, message: "User Fetched", data: user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get user info" });
  }
};

export const validateUserRole = async (req: AuthRequest, res: Response) => {
  try {
    const { role = "user" } = req.body as { role: JwtTokenPayload['role'] };
    const user_id = req.user!.user_id;

    if (role !== "admin" && role !== "user") {
      res.status(400).json({ status: 400, message: "Invalid Request" });
      return;
    }



    const [result] = await db.query("SELECT * FROM users WHERE user_id = ?", [user_id]);

    const data = {
      user: req.user,
      user_id,
      roleRecieved: role,
      userRole: req.user?.role,
    }
    console.table(data);
    console.log("Query returned Result: ", result);

    if ((result as User[])[0]?.role !== role) {
      return res.status(403).json({ status: 403, message: "Forbidden" });
    }

    res.status(200).json({ status: 200, message: "PONG" });
    return;
  } catch (err) {
    console.log("Ping Error: ", err);
    return res.status(500).json({ status: 500, message: "Error" });
  }

}
/*
export const updateUserInfo = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const updates = req.body; // dynamic JSON sent from client

    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    // Convert updates to JSON string
    const updatesJson = JSON.stringify(updates);

    // Merge updates into userdata JSON column
    const sql = `
      UPDATE users
      SET userdata = JSON_MERGE_PATCH(userdata, ?)
      WHERE id = ?
    `;
    await db.query(sql, [updatesJson, userId]);

    res.status(200).json({ status: 200, message: "User updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update user info" });
  }
};

const countUsers = async (start: Date, stop: Date) => {

  // 1. Ensure the stop date covers the full day
  const endOfDay = new Date(stop);
  endOfDay.setHours(23, 59, 59, 999);

  // 2. Format helper (Handling UTC vs Local)
  // If your DB stores local time, use this format; if UTC, use toISOString
  const formatDate = (date: Date) => date.toISOString().slice(0, 19).replace("T", " ");

  const from = formatDate(start);
  const to = formatDate(endOfDay);

  const [rows] = await db.query<(CountRow & RowDataPacket)[]>(
    `
       SELECT COUNT(DISTINCT id) AS total
        FROM users
        WHERE id IS NOT NULL
          AND created_at >= ? AND created_at <= ?
        `,
    [from, to]
  );

  return Number(rows[0]?.total ?? 0);
};





export const getUsersMetric = async (startDate: Date, stopDate: Date): Promise<any> => {

  const { prevStart, prevStop } = getPreviousDateRange(startDate, stopDate);

  const [currentCount, previousCount] = await Promise.all([
    countUsers(startDate, stopDate),
    countUsers(prevStart, prevStop)
  ]);

  return {
    code: "users",
    title: "New Users",

    current: {
      type: "count",
      value: currentCount
    },

    previous: {
      type: "count",
      value: previousCount
    },

    trend: deriveTrend(currentCount, previousCount),

    meta: {
      icon: "user-check",
      color: "#10b981",
      precision: 1
    }
  };
};
*/