静态电影网站生成说明

已生成页面：
- 首页：index.html
- 分类总览：categories.html
- 分类页：category/*.html
- 排行榜：ranking.html
- 搜索页：search.html
- 全部影片：all.html
- 影片详情页：movie/0001.html 至 movie/2000.html
- HTML 站点地图：sitemap.html
- XML 站点地图：sitemap.xml

影片封面和 Hero 图片均引用网站顶级目录下的 1.jpg 到 150.jpg。
如需显示封面，请把 1.jpg、2.jpg ... 150.jpg 放在与 index.html 同级的位置。

播放器使用 m3u8 播放源，并在详情页点击播放按钮后初始化 HLS 播放。
