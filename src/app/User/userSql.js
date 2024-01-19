export const confirmEmail =
	"SELECT EXISTS(SELECT 1 FROM member WHERE email = ?) as isExistEmail";

export const confirmUser =
	"SELECT EXISTS(SELECT 1 FROM member WHERE id = ?) as isExistUser";

export const insertUserSql =
	"INSERT INTO member (email, gender, status, created_at) VALUES (?, ?, ?, ?)";

export const getUserId = "SELECT id FROM member WHERE email = ?";

export const getUser =
	"SELECT id, email, gender, nickname FROM member WHERE id = ?";

export const patchNickname = "UPDATE member SET nickname = ? WHERE id = ?";
