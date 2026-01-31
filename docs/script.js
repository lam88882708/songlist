// 后端 API 地址（Render 后端服务的 URL）
const API_URL = "https://songlist-backend.onrender.com/api/songs";

// 全局变量：存储从后端加载的所有歌曲数据
let songs = [];
let filteredSongs = [];
let isAdmin = false; // 定义管理员模式开关

// 管理员模式密码（仅前端验证，建议后端额外增加验证）
const ADMIN_PASSWORD = "050409Mai"; // 修改为你的密码

// 启用管理员模式
function enableAdminMode() {
  const enteredPassword = document.getElementById("admin-password").value;

  // 验证管理员密码
  if (enteredPassword === ADMIN_PASSWORD) {
    isAdmin = true; // 开启管理员模式
    document.getElementById("admin-status").innerText = "管理员模式已启用";
    document.getElementById("admin-status").style.color = "green";
    document.getElementById("admin-section").style.display = "block"; // 显示添加歌曲功能
    renderSongs(); // 重渲染列表，显示删除按钮
  } else {
    alert("密码错误，无法启用管理员模式！");
  }
}

// 从后端加载歌曲
async function loadSongs() {
  try {
    const response = await fetch(API_URL);
    songs = await response.json();
    renderSongs();
  } catch (error) {
    console.error("加载歌曲失败", error);
  }
}

// 添加新歌曲
async function addSong() {
  if (!isAdmin) {
    alert("您无权限添加歌曲！");
    return;
  }

  const title = document.getElementById("title").value.trim();
  const artist = document.getElementById("artist").value.trim();
  const type = document.getElementById("type").value.trim().split("，").map(tag => tag.trim());
  const language = document.getElementById("language").value.trim().split("，").map(tag => tag.trim());

  if (!title || !artist) {
    alert("标题和歌手为必填项！");
    return;
  }

  const newSong = { title, artist, type, language };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newSong),
    });

    if (response.ok) {
      const savedSong = await response.json();
      songs.push(savedSong);
      renderSongs();
      clearForm();
    } else {
      alert("添加失败！");
    }
  } catch (error) {
    console.error("添加歌曲失败：", error);
  }
}

// 删除歌曲
async function deleteSong(id) {
  if (!isAdmin) {
    alert("您无权限删除歌曲！");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    if (response.ok) {
      songs = songs.filter(song => song._id !== id);
      renderSongs();
    } else {
      alert("删除失败！");
    }
  } catch (error) {
    console.error("删除歌曲失败：", error);
  }
}

// 渲染歌曲列表
function renderSongs() {
  const songList = document.getElementById("song-list");
  songList.innerHTML = "";

  (filteredSongs.length > 0 ? filteredSongs : songs).forEach(song => {
    const songDiv = document.createElement("div");
    songDiv.className = "song";
    songDiv.innerHTML = `
      <strong>${song.title}</strong> - ${song.artist}
      <div class="song-tags">
        <div><strong>类型：</strong>${song.type.map(tag => `<span class="tag">${tag}</span>`).join("")}</div>
        <div><strong>语言：</strong>${song.language.map(tag => `<span class="tag">${tag}</span>`).join("")}</div>
      </div>
      <button ${isAdmin ? "" : "disabled"} onclick="deleteSong('${song._id}')">删除</button>
    `;
    songList.appendChild(songDiv);
  });
}

// 清空添加歌曲表单
function clearForm() {
  document.getElementById("title").value = "";
  document.getElementById("artist").value = "";
  document.getElementById("type").value = "";
  document.getElementById("language").value = "";
}

// ...

// 页面加载时初始化
loadSongs();