ALPHABET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
BASE = len(ALPHABET)

def encode(num: int) -> str:
    if num == 0:
        return ALPHABET[0].rjust(7, ALPHABET[0])
    
    chars = []
    while num > 0:
        rem = num % BASE
        chars.append(ALPHABET[rem])
        num //= BASE
    
    # Standard base conversion: remainders are in reverse order of significance (LSB first)
    # We want MSB first, so we reverse the list.
    chars.reverse()
    
    encoded = "".join(chars)
    return encoded.rjust(7, ALPHABET[0])

def decode(string: str) -> int:
    # Not strictly needed for the shortened URL flow described, but good to have
    num = 0
    for char in string:
        num = num * BASE + ALPHABET.index(char)
    return num

