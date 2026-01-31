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
    document.getElementById("exit-admin-mode").style.display = "block"; // 显示退出按钮
    renderSongs(); // 重渲染列表，显示删除按钮
  } else {
    alert("密码错误，无法启用管理员模式！");
  }
}

// 退出管理员模式
function disableAdminMode() {
  isAdmin = false; // 关闭管理员模式
  document.getElementById("admin-status").innerText = "未启用管理员模式";
  document.getElementById("admin-status").style.color = "red";
  document.getElementById("admin-section").style.display = "none"; // 隐藏添加歌曲功能
  document.getElementById("exit-admin-mode").style.display = "none"; // 隐藏退出按钮
  document.getElementById("admin-password").value = ""; // 清空密码栏
  renderSongs(); // 重渲染列表，隐藏删除按钮
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
  const key = document.getElementById("key").value.trim();

  if (!title || !artist) {
    alert("标题和歌手为必填项！");
    return;
  }

  // 检测重复歌曲
  const isDuplicate = songs.some(song => 
    song.title.toLowerCase() === title.toLowerCase() && 
    song.artist.toLowerCase() === artist.toLowerCase()
  );

  if (isDuplicate) {
    alert("歌曲已存在！");
    return;
  }

  const newSong = { title, artist, type, language, key };

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

// 随机播放全局歌曲
function playRandomSong() {
  if (songs.length === 0) {
    alert("当前没有可播放的歌曲！");
    return;
  }

  // 从歌曲列表中随机选择一首
  const randomSong = songs[Math.floor(Math.random() * songs.length)];
  
  // 弹出窗口显示随机歌曲
  alert(`随机播放的歌曲是：\n\n标题：${randomSong.title}\n歌手：${randomSong.artist}`);
}

// 随机播放按标签筛选的歌曲
function playRandomFilteredSong() {
  // 如果有筛选结果，从筛选结果中随机播放；否则从全局歌曲中随机播放
  const targetSongs = filteredSongs.length > 0 ? filteredSongs : songs;
  
  if (targetSongs.length === 0) {
    alert("当前没有可播放的歌曲！");
    return;
  }

  // 从歌曲列表中随机选择一首
  const randomSong = targetSongs[Math.floor(Math.random() * targetSongs.length)];
  
  // 弹出窗口显示随机歌曲
  const source = filteredSongs.length > 0 ? "筛选结果中" : "全部歌曲中";
  alert(`${source}随机播放的歌曲是：\n\n标题：${randomSong.title}\n歌手：${randomSong.artist}`);
}

// 渲染歌曲列表
function renderSongs() {
  const songList = document.getElementById("song-list");
  songList.innerHTML = "";

  (filteredSongs.length > 0 ? filteredSongs : songs).forEach(song => {
    const songDiv = document.createElement("div");
    songDiv.className = "song";
    
    const typeTagsHtml = song.type.map(tag => `<span class="tag">${tag}</span>`).join(", ");
    const languageTagsHtml = song.language.map(tag => `<span class="tag">${tag}</span>`).join(", ");
    
    songDiv.innerHTML = `
      <div class="song-info">
        <div class="song-title">${song.title}</div>
        <div class="song-artist">${song.artist}</div>
      </div>
      ${isAdmin ? `<button onclick="deleteSong('${song._id}')">删除</button><button onclick="editSong('${song._id}')">编辑</button>` : ""}
      <div class="song-tags-wrapper">
        <div class="song-tags"><div><strong>类型：</strong>${typeTagsHtml}</div></div>
        <div class="song-tags"><div><strong>语言：</strong>${languageTagsHtml}</div></div>
        <div class="song-tags"><div><strong>调性：</strong><span class="tag">${song.key || "未设置"}</span></div></div>
      </div>
    `;
    songList.appendChild(songDiv);
  });
}

// 编辑歌曲
function editSong(id) {
  if (!isAdmin) {
    alert("您无权限编辑歌曲！");
    return;
  }

  const song = songs.find(s => s._id === id);
  if (!song) return;

  const newType = prompt("请输入新的类型（用逗号分隔）:", song.type.join(", "));
  if (newType === null) return; // 用户取消

  const newLanguage = prompt("请输入新的语言（用逗号分隔）:", song.language.join(", "));
  if (newLanguage === null) return; // 用户取消

  const newKey = prompt("请输入新的调性:", song.key || "");
  if (newKey === null) return; // 用户取消

  const updatedSong = {
    ...song,
    type: newType.trim().split("，").map(tag => tag.trim()),
    language: newLanguage.trim().split("，").map(tag => tag.trim()),
    key: newKey.trim()
  };

  // 发送更新请求到后端
  fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedSong),
  })
  .then(response => {
    if (response.ok) {
      // 更新本地歌曲列表
      const songIndex = songs.findIndex(s => s._id === id);
      if (songIndex !== -1) {
        songs[songIndex] = updatedSong;
      }
      renderSongs();
    } else {
      alert("编辑失败！");
    }
  })
  .catch(error => {
    console.error("编辑歌曲失败：", error);
  });
}

// 清空添加歌曲表单
function clearForm() {
  document.getElementById("title").value = "";
  document.getElementById("artist").value = "";
  document.getElementById("type").value = "";
  document.getElementById("language").value = "";
  document.getElementById("key").value = "";
}

// 筛选歌曲
function filterSongs() {
  const filterInput = document.getElementById("filter-input").value.trim().toLowerCase();
  
  if (!filterInput) {
    alert("请输入筛选条件！");
    return;
  }

  filteredSongs = songs.filter(song => {
    const tags = [...song.type, ...song.language];
    return tags.some(tag => tag.toLowerCase().includes(filterInput));
  });

  if (filteredSongs.length === 0) {
    alert("未找到符合条件的歌曲！");
  }

  renderSongs();
}

// 重置筛选
function resetFilter() {
  filteredSongs = [];
  document.getElementById("filter-input").value = "";
  renderSongs();
}

// 搜索歌曲（按标题和歌手）
function searchSongs() {
  const searchInput = document.getElementById("search-input").value.trim().toLowerCase();
  
  if (!searchInput) {
    alert("请输入搜索条件！");
    return;
  }

  filteredSongs = songs.filter(song => {
    return song.title.toLowerCase().includes(searchInput) || song.artist.toLowerCase().includes(searchInput);
  });

  if (filteredSongs.length === 0) {
    alert("未找到符合条件的歌曲！");
  }

  renderSongs();
}

// 重置搜索
function resetSearch() {
  filteredSongs = [];
  document.getElementById("search-input").value = "";
  renderSongs();
}

// 页面加载时初始化
loadSongs();

// 绑定随机播放和退出管理员模式的事件
document.getElementById("play-global-random").addEventListener("click", playRandomSong);
document.getElementById("play-filtered-random").addEventListener("click", playRandomFilteredSong);
document.getElementById("exit-admin-mode").addEventListener("click", disableAdminMode);