from playwright.sync_api import sync_playwright
import json,sys
B="http://localhost:8765/";errs=[];res={}
with sync_playwright() as p:
    br=p.chromium.launch(executable_path="/usr/bin/google-chrome",args=["--no-sandbox"])
    pg=br.new_page(viewport={"width":1280,"height":900})
    pg.on("pageerror",lambda e:errs.append(str(e)));pg.on("console",lambda m:m.type=="error" and errs.append(m.text))
    pg.goto(B);pg.screenshot(path="screenshots/landing.png")
    tpls=pg.evaluate("PB.TEMPLATES.map(t=>({id:t.id,p:t.platform,pro:t.pro}))")
    for t in tpls:
        pg.click(f'#plat .pill[data-p="{t["p"]}"]');pg.click(f'.tpl[data-id="{t["id"]}"]')
        if t["pro"]:
            assert pg.is_visible("#lockbox"),t; res[t["id"]]="locked-ok"; continue
        pg.click("#ex");pg.click("#gen");o=pg.inner_text("#out")
        assert "## Task" in o and "(not provided)" not in o.split("## Etsy")[0].split("## Amazon")[0],t
        res[t["id"]]=len(o)
        if t["id"]=="etsy-tags": pg.locator("#builder").scroll_into_view_if_needed(); pg.screenshot(path="screenshots/builder.png")
    # unlock then test pro
    pg.once("dialog",lambda d:d.accept("LAB-PRO-2026"));pg.click("#havecode")
    for t in [x for x in tpls if x["pro"]]:
        pg.click(f'#plat .pill[data-p="{t["p"]}"]');pg.click(f'.tpl[data-id="{t["id"]}"]');pg.click("#ex");pg.click("#gen")
        assert "## Task" in pg.inner_text("#out"),t; res[t["id"]+"(unlocked)"]="ok"
    pg.goto(B+"tools.html");pg.wait_for_selector("#dir table");res["tools_rows"]=pg.locator("#dir tr").count()
    m=br.new_page(viewport={"width":390,"height":844},is_mobile=True);m.on("pageerror",lambda e:errs.append(str(e)))
    m.goto(B+"#builder");m.click("#ex");m.click("#gen");m.screenshot(path="screenshots/mobile.png",full_page=False)
    for f in ["refund.html","privacy.html","terms.html"]:
        pg.goto(B+f);assert "labtryai" in pg.inner_text("main") or "@" in pg.inner_text("main"),f;res[f]="ok"
    # Gumroad licence path (API mocked): valid key unlocks, refunded key rejected
    import re as _re
    for key,refunded,expect in [("GOOD-KEY",False,"1"),("REFUNDED-KEY",True,None)]:
        ctx=br.new_context();g=ctx.new_page();g.on("pageerror",lambda e:errs.append(str(e)))
        cfg=open("config.js").read().replace('GUMROAD_PRODUCT_ID: ""','GUMROAD_PRODUCT_ID: "TESTPROD"')
        g.route("**/config.js",lambda r:r.fulfill(body=cfg,content_type="application/javascript"))
        seen={}
        def api(r,_req=None,refunded=refunded):
            seen["body"]=r.request.post_data
            r.fulfill(status=200,headers={"Access-Control-Allow-Origin":"*"},content_type="application/json",body=json.dumps({"success":True,"purchase":{"refunded":refunded,"chargebacked":False}}))
        g.route("https://api.gumroad.com/**",api)
        g.goto(B);g.on("dialog",lambda d:d.accept(key) if d.type=="prompt" else d.accept());g.click("#havecode");g.wait_for_timeout(800)
        st=g.evaluate("localStorage.getItem('pb_pro_unlocked')");assert st==expect,(key,st);assert "product_id=TESTPROD" in seen["body"]
        res["gumroad_"+key]="ok";ctx.close()
    br.close()
print(json.dumps(res,indent=1));print("ERRORS:",errs);sys.exit(1 if errs else 0)
