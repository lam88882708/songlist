// 后端 API 地址（Render 后端服务的 URL）
const API_URL = "https://songlist-backend.onrender.com/api/songs";

// 全局变量：存储从后端加载的所有歌曲数据
let songs = [];
let filteredSongs = [];
let isAdmin = false; // 定义管理员模式开关
let currentPage = 1;
const PAGE_SIZE = 10;

// 管理员模式密码（仅前端验证，建议后端额外增加验证）
const ADMIN_PASSWORD = "050409Mai"; // 修改为你的密码

// 侧栏切换
function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  sidebar.classList.toggle("active");
}

// 关闭侧栏
function closeSidebar() {
  const sidebar = document.getElementById("sidebar");
  sidebar.classList.remove("active");
}

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
    currentPage = 1;
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
  // 在随机容器内显示随机歌曲
  const resultEl = document.getElementById('random-result');
  if (resultEl) {
    resultEl.innerHTML = `
      <div class="random-row">
        <div class="random-left">
          <div class="random-title">${randomSong.title}</div>
          <div class="random-artist">${randomSong.artist}</div>
        </div>
        <div class="random-key">调性：${randomSong.key || "未设置"}</div>
      </div>
    `;
  } else {
    alert(`随机播放的歌曲是：\n\n标题：${randomSong.title}\n歌手：${randomSong.artist}`);
  }
}

// 随机播放按标签筛选的歌曲
function playRandomFilteredSong() {
  // 如果有筛选结果，从筛选结果中随机播放；否则从全局歌曲中随机播放
  const targetSongs = filteredSongs.length > 0 ? filteredSongs : songs;
  
  if (targetSongs.length === 0) {
    const resultElEmpty = document.getElementById('random-result');
    if (resultElEmpty) {
      resultElEmpty.innerHTML = `<div class="random-empty">当前没有可播放的歌曲！</div>`;
    } else {
      alert("当前没有可播放的歌曲！");
    }
    return;
  }

  // 从歌曲列表中随机选择一首
  const randomSong = targetSongs[Math.floor(Math.random() * targetSongs.length)];
  // 在随机容器内显示随机歌曲
  const source = filteredSongs.length > 0 ? "筛选结果中" : "全部歌曲中";
  const resultEl = document.getElementById('random-result');
  if (resultEl) {
    resultEl.innerHTML = `
      <div class="random-source">${source}</div>
      <div class="random-row">
        <div class="random-left">
          <div class="random-title">${randomSong.title}</div>
          <div class="random-artist">${randomSong.artist}</div>
        </div>
        <div class="random-key">调性：${randomSong.key || "未设置"}</div>
      </div>
    `;
  } else {
    alert(`${source}随机播放的歌曲是：\n\n标题：${randomSong.title}\n歌手：${randomSong.artist}`);
  }
}

// 渲染歌曲列表
function renderSongs() {
  const songList = document.getElementById("song-list");
  songList.innerHTML = "";
  const list = filteredSongs.length > 0 ? filteredSongs : songs;
  const totalItems = list.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  if (currentPage > totalPages) currentPage = totalPages;
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageItems = list.slice(start, start + PAGE_SIZE);

  pageItems.forEach(song => {
    const songDiv = document.createElement("div");
    songDiv.className = "song";

    const typeTagsHtml = song.type.map(tag => `<span class="tag">${tag}</span>`).join(", ");
    const languageTagsHtml = song.language.map(tag => `<span class="tag">${tag}</span>`).join(", ");

    songDiv.innerHTML = `
      <div class="song-info">
        <div class="song-title">${song.title}</div>
        <div class="song-artist">${song.artist}</div>
      </div>
      <div class="song-buttons">
        ${isAdmin ? `<button onclick="deleteSong('${song._id}')">删除</button><button onclick="editSong('${song._id}')">编辑</button>` : ""}
      </div>
      <div class="song-tags-wrapper">
        <div class="song-tags"><div><strong>类型：</strong>${typeTagsHtml}</div></div>
        <div class="song-tags"><div><strong>语言：</strong>${languageTagsHtml}</div></div>
        <div class="song-tags"><div><strong>调性：</strong><span class="tag">${song.key || "未设置"}</span></div></div>
      </div>
    `;
    songList.appendChild(songDiv);
  });

  updatePagination(totalItems);
}

function getTotalPages(totalItems) {
  return Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
}

function goToPage(n) {
  const listLength = filteredSongs.length > 0 ? filteredSongs.length : songs.length;
  const total = getTotalPages(listLength);
  if (n < 1) n = 1;
  if (n > total) n = total;
  currentPage = n;
  renderSongs();
}

function updatePagination(totalItems) {
  const pagination = document.getElementById('pagination');
  if (!pagination) return;
  pagination.innerHTML = '';
  const total = getTotalPages(totalItems);
  // 上一页按钮
  const prev = document.createElement('button');
  prev.textContent = '上一页';
  prev.disabled = currentPage === 1;
  prev.addEventListener('click', () => goToPage(currentPage - 1));
  pagination.appendChild(prev);

  // 数字页码（在中间）
  const pagesContainer = document.createElement('div');
  pagesContainer.className = 'pages-container';

  const maxButtons = 7; // 最大显示按钮数量
  let startPage = 1;
  let endPage = total;
  if (total > maxButtons) {
    const half = Math.floor(maxButtons / 2);
    startPage = Math.max(1, currentPage - half);
    endPage = startPage + maxButtons - 1;
    if (endPage > total) {
      endPage = total;
      startPage = endPage - maxButtons + 1;
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    const p = document.createElement('button');
    p.className = 'page-num';
    p.textContent = String(i);
    if (i === currentPage) {
      p.classList.add('active');
      p.disabled = true;
    }
    p.addEventListener('click', () => goToPage(i));
    pagesContainer.appendChild(p);
  }

  // 在 prev 之后放置数字页码（带省略），然后放 next
  if (startPage > 1) {
    const leftEll = document.createElement('span');
    leftEll.className = 'ellipsis';
    leftEll.textContent = '...';
    pagination.appendChild(leftEll);
  }

  pagination.appendChild(pagesContainer);

  if (endPage < total) {
    const rightEll = document.createElement('span');
    rightEll.className = 'ellipsis';
    rightEll.textContent = '...';
    pagination.appendChild(rightEll);
  }

  const next = document.createElement('button');
  next.textContent = '下一页';
  next.disabled = currentPage === total;
  next.addEventListener('click', () => goToPage(currentPage + 1));
  pagination.appendChild(next);
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

  currentPage = 1;
  renderSongs();
}

// 重置筛选
function resetFilter() {
  filteredSongs = [];
  document.getElementById("filter-input").value = "";
  currentPage = 1;
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

  currentPage = 1;
  renderSongs();
}

// 重置搜索
function resetSearch() {
  filteredSongs = [];
  document.getElementById("search-input").value = "";
  currentPage = 1;
  renderSongs();
}

// 页面加载时初始化
loadSongs();

// 绑定随机播放和退出管理员模式的事件
document.getElementById("play-global-random").addEventListener("click", playRandomSong);
document.getElementById("play-filtered-random").addEventListener("click", playRandomFilteredSong);
document.getElementById("exit-admin-mode").addEventListener("click", disableAdminMode);