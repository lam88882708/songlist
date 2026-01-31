// 后端 API 地址（Render 后端服务的 URL）
const API_URL = "https://songlist-backend.onrender.com/api/songs";

// 全局变量：存储从后端加载的所有歌曲数据
let songs = [];
let filteredSongs = [];

// 从后端加载歌曲
async function loadSongs() {
  try {
    const response = await fetch(API_URL); // 请求后端 API
    songs = await response.json(); // 将响应解析为 JSON 格式
    renderSongs(); // 渲染歌曲到页面
  } catch (error) {
    console.error("加载歌曲失败", error);
  }
}

// 添加新歌曲
async function addSong() {
  // 获取表单输入的值
  const title = document.getElementById("title").value.trim();
  const artist = document.getElementById("artist").value.trim();
  const type = document.getElementById("type").value.trim().split("，").map(tag => tag.trim());
  const language = document.getElementById("language").value.trim().split("，").map(tag => tag.trim());

  // 检查表单必填字段
  if (!title || !artist) {
    alert("标题和歌手为必填项！");
    return;
  }

  // 创建新歌曲对象
  const newSong = { title, artist, type, language };

  // 提交到后端
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newSong),
    });

    if (response.ok) {
      const savedSong = await response.json(); // 获取保存成功的歌曲
      songs.push(savedSong); // 更新前端的歌曲列表
      renderSongs(); // 重新渲染歌曲列表
      clearForm(); // 清空表单
    } else {
      alert("添加失败！");
    }
  } catch (error) {
    console.error("添加歌曲失败：", error);
  }
}

// 删除歌曲
async function deleteSong(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    if (response.ok) {
      songs = songs.filter(song => song._id !== id); // 从列表中移除
      renderSongs(); // 重新渲染列表
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
  songList.innerHTML = ""; // 清空旧的列表

  (filteredSongs.length > 0 ? filteredSongs : songs).forEach(song => {
    const songDiv = document.createElement("div");
    songDiv.className = "song"; // 样式类名
    songDiv.innerHTML = `
      <strong>${song.title}</strong> - ${song.artist}
      <div class="song-tags">
        <div><strong>类型：</strong>${song.type.map(tag => `<span class="tag">${tag}</span>`).join("")}</div>
        <div><strong>语言：</strong>${song.language.map(tag => `<span class="tag">${tag}</span>`).join("")}</div>
      </div>
      <button onclick="deleteSong('${song._id}')">删除</button>
    `;
    songList.appendChild(songDiv); // 添加到列表中
  });
}

// 清空表单
function clearForm() {
  document.getElementById("title").value = "";
  document.getElementById("artist").value = "";
  document.getElementById("type").value = "";
  document.getElementById("language").value = "";
}

// 筛选歌曲
function filterSongs() {
  const filterType = document.getElementById("filter-type").value.trim();
  const filterLanguage = document.getElementById("filter-language").value.trim();

  // 根据类型和语言筛选
  filteredSongs = songs.filter(song => {
    const matchesType = !filterType || song.type.includes(filterType);
    const matchesLanguage = !filterLanguage || song.language.includes(filterLanguage);
    return matchesType && matchesLanguage;
  });

  renderSongs();
}

// 重置筛选条件
function resetFilter() {
  filteredSongs = []; // 清空筛选结果
  renderSongs();
}

// 获取随机歌曲（全局）
function getRandomSong() {
  if (songs.length === 0) {
    alert("歌曲列表为空！");
    return;
  }
  const randomSong = songs[Math.floor(Math.random() * songs.length)];
  document.getElementById("random-result").innerText = `🎵 ${randomSong.title} - ${randomSong.artist}`;
}

// 获取随机歌曲（筛选结果）
function getRandomFilteredSong() {
  if (filteredSongs.length === 0) {
    alert("没有符合筛选条件的歌曲！");
    return;
  }
  const randomSong = filteredSongs[Math.floor(Math.random() * filteredSongs.length)];
  document.getElementById("random-result").innerText = `🎵 ${randomSong.title} - ${randomSong.artist}`;
}

// 页面加载时从后端拉取数据
loadSongs();