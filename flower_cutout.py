from PIL import Image, ImageDraw

im = Image.open("public/generated.png").convert("RGBA")
w, h = im.size

# Flood-fill the white background from the four corners (keeps light areas
# INSIDE the flower, only removes the connected outer white).
rgb = im.convert("RGB")
sentinel = (255, 0, 255)
for seed in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)]:
    ImageDraw.floodfill(rgb, seed, sentinel, thresh=45)

px = im.load()
rp = rgb.load()
for y in range(h):
    for x in range(w):
        if rp[x, y] == sentinel:
            r, g, b, _ = px[x, y]
            px[x, y] = (r, g, b, 0)

bbox = im.getbbox()
flower = im.crop(bbox)
flower.save("public/flower.png")
print("flower saved, size:", flower.size)
