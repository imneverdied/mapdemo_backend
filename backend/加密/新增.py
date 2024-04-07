import hashlib

def sha(text):
    # 使用 hashlib 库的 sha256 方法计算文本的哈希值
    hash_object = hashlib.sha256(text.encode())
    # 使用 digest 方法获取哈希值的二进制表示
    hash_bytes = hash_object.digest()
    # 将二进制哈希值转换为十六进制字符串，并取前8个字符作为较短的哈希值
    short_hash = hash_bytes.hex()[:8]
    return short_hash

# 输入要转换的文本
input_text = input("请输入要转换的文本：")

# 调用函数将文本转换为较短的哈希值
short_hashed_text = sha(input_text)

print(short_hashed_text)
input()
