// 引入必要模块
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

// 创建 Express 应用
const app = express();
const PORT = process.env.PORT || 3000;

// 使用中间件
app.use(cors());
app.use(bodyParser.json());

// MongoDB 连接字符串（请替换为你的 MongoDB Atlas 连接字符串）
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://render:oSUVToXS6Nxdk40R@cluster0.zjroogr.mongodb.net/songlist?retryWrites=true&w=majority";

// 连接 MongoDB
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("成功连接到 MongoDB"))
  .catch((err) => console.error("连接 MongoDB 失败：", err));

// 定义歌曲模型
const SongSchema = new mongoose.Schema({
  title: { type: String},
  artist: { type: String},
  type: { type: [String]},
  language: { type: [String]},
});

const Song = mongoose.model("Song", SongSchema);

// 路由定义
// 获取所有歌曲
app.get("/api/songs", async (req, res) => {
  try {
    const songs = await Song.find();
    res.json(songs);
  } catch (err) {
    res.status(500).json({ error: "获取歌曲失败" });
  }
});

// 添加新歌曲
app.post("/api/songs", async (req, res) => {
  try {
    const newSong = new Song(req.body);
    const savedSong = await newSong.save();
    res.status(201).json(savedSong);
  } catch (err) {
    res.status(500).json({ error: "添加歌曲失败" });
  }
});

// 删除歌曲
app.delete("/api/songs/:id", async (req, res) => {
  try {
    const deletedSong = await Song.findByIdAndDelete(req.params.id);
    if (!deletedSong) return res.status(404).json({ error: "歌曲未找到" });
    res.json({ message: "歌曲已删除" });
  } catch (err) {
    res.status(500).json({ error: "删除歌曲失败" });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器正在运行：http://localhost:${PORT}`);
});