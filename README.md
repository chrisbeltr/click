# borks.click

## what

a personal link shortener.

## why

i've always wanted to make a link shortener.  
additionally, this is a great excuse to learn more about backend development, networking, and databases.

## how

the main feature, of course, is the link shortener at `borks.click`. here, you can shorten links and store text.  
after the form is submitted, if there was no error, you will get a new (hopefully shorter) link to use. it will be automatically copied to your clipboard.  
if the form input starts with `http(s)`, it will be treated as a link. otherwise, it will be treated as normal text.  
you can also give your link a custom name, as long as it's not taken. this will be what comes after the main link (e.g. [`https://borks.click/customlink`](https://borks.click/customlink)).

you can put `qr.` in front of any `borks.click` link (`https://qr.borks.click/...`) in order to generate a qr code for said link.  
normally, sending a GET request to a `qr.borks.click/...` link (e.g. navigating to it in a browser) will give you a png of a qr code. this image is automatically embedded on services like discord.  
if you send a GET request to a `qr.borks.click/...` link with the `Prefer` header set to `terminal` (e.g. `curl -H "Prefer: terminal" -L `[`https://qr.borks.click/1UCxsd`](https://qr.borks.click/1UCxsd)), the output will be an ascii qr code.  
additionally, you can pass in a few query parameters to customize the colors of the qr code:
- `dark`, `light`
  - hex codes for the dark and light colors of the qr code
  - format: RRGGBBAA (red, green, blue, and alpha)
  - if you specify one, you need to specify the other
  - e.g. [`https://qr.borks.click/3IRccn?dark=013f80ff&light=b8e548ff`](https://qr.borks.click/3IRccn?dark=013f80ff&light=b8e548ff)
- `preset`
  - `default`: dark: `#000000ff`, light: `#ffffffff`
  - `light`: dark: `#bbe4f9ff`, light: `#ffffffff`
  - `dark`: dark: `#000000ff`, light: `#454647ff`
  - `borks`: dark: `#ac6962ff`, light: `#ffe482ff`
  - `fall`: dark: `#450222ff`, light: `#977bb7ff`
  - `random`: chooses one of the previous presets at random
  - e.g. [`https://qr.borks.click/64vfpZ?preset=random`](https://qr.borks.click/64vfpZ?preset=random)

finally, there's a niche feature that i don't forsee anyone using.  
if you happen to be using OpenNIC DNS servers, i've set up the [`http://brks.o/`](http://brks.o/) domain as an alias. there is nothing different about it, except that it cannot automatically copy links to your clipboard.  
(if you're interested in learning more, check out [OpenNIC's website](https://borks.click/1ljVSU) and these [helpful DNS wizard links on their wiki](https://borks.click/1Zkhnm))

## where

i'm hosting this project on a home server i run myself, managing the routing with caddy.  
i'm using google cloud firestore for my database and was previously using google cloud compute to host as well.  
i'm using simple node.js for the backend and vanilla html css js for the frontend.
