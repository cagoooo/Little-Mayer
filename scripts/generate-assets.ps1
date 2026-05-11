# 生成所有 favicon / og-preview 圖片資源
# 用法：.\scripts\generate-assets.ps1
#
# 產出檔案：
#   - favicon.png             (32x32 給瀏覽器分頁)
#   - favicon-192.png         (192x192 給 PWA)
#   - apple-touch-icon.png    (180x180 給 iOS 加到主畫面)
#   - assets/og-preview.png   (1200x630 給 FB / LINE / Twitter 分享)

Add-Type -AssemblyName System.Drawing
$ErrorActionPreference = "Stop"

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$photoDir = Join-Path $root "assets\photos"
$assetsDir = Join-Path $root "assets"

# ========================================================================
# 工具函式：把 favicon.svg 轉成 PNG 是麻煩的（Windows 缺 SVG 渲染器）
# 改成直接用 Drawing 重畫一個對應風格的 PNG
# ========================================================================
function New-FaviconPng {
    param([int]$Size, [string]$OutPath)

    $bmp = New-Object System.Drawing.Bitmap($Size, $Size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

    # 藍色漸層圓角矩形背景
    $rectBg = New-Object System.Drawing.Rectangle(0, 0, $Size, $Size)
    $brushBg = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        $rectBg, [System.Drawing.Color]::FromArgb(59,130,246),
        [System.Drawing.Color]::FromArgb(30,64,175),
        [System.Drawing.Drawing2D.LinearGradientMode]::Vertical)

    $cornerR = [int]($Size * 0.22)
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $path.AddArc(0, 0, $cornerR*2, $cornerR*2, 180, 90)
    $path.AddArc($Size-$cornerR*2, 0, $cornerR*2, $cornerR*2, 270, 90)
    $path.AddArc($Size-$cornerR*2, $Size-$cornerR*2, $cornerR*2, $cornerR*2, 0, 90)
    $path.AddArc(0, $Size-$cornerR*2, $cornerR*2, $cornerR*2, 90, 90)
    $path.CloseFigure()
    $g.FillPath($brushBg, $path)

    # 中央寫一個白色「票」字
    $fontSize = [int]($Size * 0.55)
    $font = New-Object System.Drawing.Font("Microsoft JhengHei UI", $fontSize, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
    $brushText = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
    $sf = New-Object System.Drawing.StringFormat
    $sf.Alignment = [System.Drawing.StringAlignment]::Center
    $sf.LineAlignment = [System.Drawing.StringAlignment]::Center
    $rectText = New-Object System.Drawing.RectangleF(0, [single]($Size * 0.04), [single]$Size, [single]$Size)
    $g.DrawString("票", $font, $brushText, $rectText, $sf)

    # 儲存
    $bmp.Save($OutPath, [System.Drawing.Imaging.ImageFormat]::Png)

    $g.Dispose()
    $bmp.Dispose()
    $brushBg.Dispose()
    $brushText.Dispose()
    $font.Dispose()

    Write-Host "OK $OutPath ($Size x $Size)" -ForegroundColor Green
}

# ========================================================================
# OG 分享預覽圖 1200x630
# ========================================================================
function New-OgPreview {
    param([string]$OutPath)

    $W = 1200
    $H = 630
    $bmp = New-Object System.Drawing.Bitmap($W, $H)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    # 紫藍漸層背景
    $rect = New-Object System.Drawing.Rectangle(0, 0, $W, $H)
    $bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        $rect,
        [System.Drawing.Color]::FromArgb(102, 126, 234),
        [System.Drawing.Color]::FromArgb(118, 75, 162),
        [System.Drawing.Drawing2D.LinearGradientMode]::ForwardDiagonal)
    $g.FillRectangle($bgBrush, $rect)

    # 半透明白色裝飾大圓（左上角）
    $whiteFog = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(20, 255, 255, 255))
    $g.FillEllipse($whiteFog, -150, -200, 600, 600)
    $g.FillEllipse($whiteFog, $W-300, $H-300, 500, 500)

    # 上方學校標籤膠囊
    $tagBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(80, 255, 255, 255))
    $tagPath = New-Object System.Drawing.Drawing2D.GraphicsPath
    $tagX = 80; $tagY = 70; $tagW = 200; $tagH = 44; $tagR = 22
    $tagPath.AddArc($tagX, $tagY, $tagR*2, $tagR*2, 180, 90)
    $tagPath.AddArc($tagX+$tagW-$tagR*2, $tagY, $tagR*2, $tagR*2, 270, 90)
    $tagPath.AddArc($tagX+$tagW-$tagR*2, $tagY+$tagH-$tagR*2, $tagR*2, $tagR*2, 0, 90)
    $tagPath.AddArc($tagX, $tagY+$tagH-$tagR*2, $tagR*2, $tagR*2, 90, 90)
    $tagPath.CloseFigure()
    $g.FillPath($tagBrush, $tagPath)

    $tagFont = New-Object System.Drawing.Font("Microsoft JhengHei UI", 18, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
    $whiteText = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
    $g.DrawString("石門國小", $tagFont, $whiteText, [single]($tagX+50), [single]($tagY+12))

    # 主標題：石門國小第 29 屆自治市市長選舉
    $titleFont = New-Object System.Drawing.Font("Microsoft JhengHei UI", 70, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
    $g.DrawString("第 29 屆自治市市長選舉", $titleFont, $whiteText, [single]70, [single]150)

    # 副標題
    $subFont = New-Object System.Drawing.Font("Microsoft JhengHei UI", 36, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
    $subBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(220, 230, 240, 255))
    $g.DrawString("即時計票與監票系統", $subFont, $subBrush, [single]70, [single]250)

    # 中段：6 位候選人小頭像橫排
    $photoY = 380
    $photoSize = 110
    $photoGap = 22
    $totalW = $photoSize * 6 + $photoGap * 5
    $startX = ($W - $totalW) / 2
    for ($i = 1; $i -le 6; $i++) {
        $px = $startX + ($i - 1) * ($photoSize + $photoGap)
        $photoPath = Join-Path $photoDir "$i.jpg"
        if (Test-Path $photoPath) {
            $img = [System.Drawing.Image]::FromFile($photoPath)
            # 畫圓形頭像 + 白色 4px 邊框
            $clipPath = New-Object System.Drawing.Drawing2D.GraphicsPath
            $clipPath.AddEllipse($px, $photoY, $photoSize, $photoSize)
            $g.SetClip($clipPath)
            $g.DrawImage($img, $px, $photoY, $photoSize, $photoSize)
            $g.ResetClip()
            $borderPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::White, 4)
            $g.DrawEllipse($borderPen, $px, $photoY, $photoSize, $photoSize)
            $img.Dispose()
            $borderPen.Dispose()

            # 號碼小徽章在左下
            $badgeFont = New-Object System.Drawing.Font("Microsoft JhengHei UI", 18, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
            $badgeBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(30, 64, 175))
            $bX = $px + ($photoSize/2) - 14
            $bY = $photoY + $photoSize - 12
            $g.FillEllipse($badgeBrush, $bX, $bY, 28, 28)
            $g.DrawString("$i", $badgeFont, $whiteText, [single]($bX + 6), [single]($bY + 4))
            $badgeFont.Dispose(); $badgeBrush.Dispose()
        }
    }

    # 底部：URL 與 Made by
    $footFont = New-Object System.Drawing.Font("Microsoft JhengHei UI", 22, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
    $footBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(200, 255, 255, 255))
    $g.DrawString("cagoooo.github.io/Little-Mayer", $footFont, $footBrush, [single]70, [single]560)
    $g.DrawString("Made by 阿凱老師", $footFont, $footBrush, [single]($W - 280), [single]560)

    # 儲存（高品質 PNG）
    $bmp.Save($OutPath, [System.Drawing.Imaging.ImageFormat]::Png)

    # 釋放資源
    $g.Dispose(); $bmp.Dispose()
    $bgBrush.Dispose(); $whiteFog.Dispose(); $tagBrush.Dispose()
    $whiteText.Dispose(); $subBrush.Dispose(); $footBrush.Dispose()
    $titleFont.Dispose(); $subFont.Dispose(); $tagFont.Dispose(); $footFont.Dispose()

    Write-Host "OK $OutPath (1200x630)" -ForegroundColor Green
}

# ========================================================================
# 執行
# ========================================================================
Write-Host ""
Write-Host "=== Generating favicons ===" -ForegroundColor Cyan
New-FaviconPng -Size 32  -OutPath (Join-Path $root "favicon.png")
New-FaviconPng -Size 192 -OutPath (Join-Path $root "favicon-192.png")
New-FaviconPng -Size 180 -OutPath (Join-Path $root "apple-touch-icon.png")

Write-Host ""
Write-Host "=== Generating og-preview.png ===" -ForegroundColor Cyan
New-OgPreview -OutPath (Join-Path $assetsDir "og-preview.png")

Write-Host ""
Write-Host "All done!" -ForegroundColor Cyan
