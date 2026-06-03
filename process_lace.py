from PIL import Image

# 1) Open the generated lace and make the light background transparent
im = Image.open("public/generated.png").convert("RGBA")
px = im.load()
w, h = im.size
LO, HI = 175, 222  # below LO = fully opaque, above HI = fully transparent
for y in range(h):
    for x in range(w):
        r, g, b, a = px[x, y]
        mn = min(r, g, b)
        if mn >= HI:
            alpha = 0
        elif mn <= LO:
            alpha = 255
        else:
            alpha = int((HI - mn) / (HI - LO) * 255)
        px[x, y] = (r, g, b, alpha)

# 2) Crop tightly to the lace
bbox = im.getbbox()
band = im.crop(bbox)

# 3) Make four edge versions: flat edge toward the card, scallops pointing outward.
#    The lace band has its flat edge on top and scalloped edge on the bottom.
band.transpose(Image.FLIP_TOP_BOTTOM).save("public/lace-top.png")     # scallops up
band.save("public/lace-bottom.png")                                   # scallops down
band.rotate(270, expand=True).save("public/lace-left.png")            # scallops left
band.rotate(90, expand=True).save("public/lace-right.png")            # scallops right

print("Created lace-top/bottom/left/right.png, band size:", band.size)
