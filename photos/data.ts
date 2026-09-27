import photo0 from './p-2026-09-21-05-59-19-000-1.jpg?url'
import photo1 from './p-2026-09-21-08-04-42-000-1.jpg?url'
import photo2 from './p-2026-09-22-04-44-37-000-1.jpg?url'
import photo3 from './p-2026-09-25-13-12-57-000-1.jpg?url'
import photo4 from './p-2026-09-25-13-14-02-000-1.jpg?url'

export interface Photo {
  url: string
  text: string
  lang?: string
  blurhash?: string
}

const photos: Photo[] = [
  { url: photo4, text: '蓝天下的秋日黄叶', lang: 'zh-CN', blurhash: 'UdE3Yc--TOf,x{oIXBWZIWRlRPR:tRo#kDkD' },
  { url: photo3, text: '长白山天池', lang: 'zh-CN', blurhash: 'U;9SoYozjYj]lCbIazfkbdjsflfkIvWXfkbH' },
  { url: photo2, text: '长白山，海拔 2470 米', lang: 'zh-CN', blurhash: 'UwDwdkWCoeofG1j[kCWCtnV@WBofIBoJoeWq' },
  { url: photo1, text: '落叶间游弋的两只鹅', lang: 'zh-CN', blurhash: 'UJ8X%+tnM|Rjt:tnadadOubxsls+x]t8WVWA' },
  { url: photo0, text: '石阶旁的蓝色马赛克墙', lang: 'zh-CN', blurhash: 'UEAKE#ROxUt7TNxYMwRj.AIUnzj[IpxujXWB' },
]

export default photos
