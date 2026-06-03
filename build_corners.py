from PIL import Image

ARM = 240   # how long each arm of the corner is
TH = 42     # thickness of the lace

top = Image.open("public/lace-top.png").convert("RGBA").resize((ARM, TH))
left = Image.open("public/lace-left.png").convert("RGBA").resize((TH, ARM))

# Build the top-left corner: a horizontal arm + a vertical arm meeting at 0,0
c = Image.new("RGBA", (ARM, ARM), (0, 0, 0, 0))
c.alpha_composite(top, (0, 0))
c.alpha_composite(left, (0, 0))

c.save("public/corner-tl.png")
c.transpose(Image.FLIP_LEFT_RIGHT).save("public/corner-tr.png")
c.transpose(Image.FLIP_TOP_BOTTOM).save("public/corner-bl.png")
c.transpose(Image.FLIP_LEFT_RIGHT).transpose(Image.FLIP_TOP_BOTTOM).save("public/corner-br.png")

print("Built 4 corner images, size:", c.size)
