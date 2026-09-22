1. Nhac Tuan Anh
2. HE194418

Article APIs (Quản lý bài viết):

GET /articles: Lấy danh sách toàn bộ bài viết.
GET /articles/:id: Lấy thông tin chi tiết của một bài viết dựa trên ID.
POST /articles: Tạo một bài viết mới.
PUT /articles/:id: Cập nhật thông tin của một bài viết hiện có.
DELETE /articles/:id: Xóa một bài viết (các bình luận thuộc bài viết này cũng sẽ bị xóa theo)

Comment APIs (Quản lý bình luận):

GET /comments: Lấy danh sách toàn bộ bình luận
GET /comments/:id: Lấy chi tiết một bình luận dựa trên ID
POST /comments: Tạo một bình luận mới cho một bài viết.
PUT /comments/:id: Chỉnh sửa nội dung của một bình luận.
DELETE /comments/:id: Xóa một bình luận.




