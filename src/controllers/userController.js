const userService = require("../services/userService");
const createUser = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        ok: false,
        message: "Name is Required",
      });
    }
    const result = await userService.createUserWithWallet(name.trim());
    return res.status(201).json({
      ok: true,
      message: "User created Successfully",
      data: result,
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      message: "Something went wrong",
      error: err.message,
    });
  }
};
module.exports = { createUser };
