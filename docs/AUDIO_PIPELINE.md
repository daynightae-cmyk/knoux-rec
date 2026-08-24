# مسار الصوت والدمج المحلي

**الحالة:** منفذ جزئياً ومتحقق برمجياً.  
**النطاق:** Windows x64 داخل تطبيق Electron فقط.

> لا يصف هذا المستند صوت نظام مدمجاً على أنه ناجح إلا بعد أن يفحص `ffprobe` الملف الناتج ويجد stream فيديو وstream صوت فعليين.

## 1. المكونات

يستخدم KNOuX REC مصدرين مستقلين: صوت النظام من مساعد C# محلي مبني على `WasapiLoopbackCapture`، والميكروفون من `getUserMedia` داخل واجهة التطبيق. تكتب الشاشة أو الشاشة مع الميكروفون أولاً على دفعات WebM صغيرة إلى ملف `.part`. عند الإنهاء الآمن، يوقف التطبيق مساعد WASAPI ويثبت أن WAV يحتوي على PCM، ثم يمرر ملف الفيديو وملف WAV إلى backend وسائط محلي محدود الصلاحية.

| المكوّن | المسؤولية الفعلية | موضع التنفيذ |
|---|---|---|
| WASAPI helper | تعداد مخارج Windows والتقاط loopback إلى WAV | `desktop/audio-helper/Program.cs` |
| Native audio service | تشغيل/إيقاف helper ورفض WAV الفارغ | `desktop/native-audio.cjs` |
| Recorder | مزج Track الميكروفون داخل WebM عند اختياره وإرسال chunks للقرص | `hooks/useRecorder.ts` |
| Media backend | دمج WAV في WebM، أو مزج mic+system، وفحص الناتج | `desktop/media-backend.cjs` |
| FFmpeg runtime | `ffmpeg.exe` و`ffprobe.exe` محليان خارج ASAR | `desktop/ffmpeg/runtime/` |

## 2. حالات الصوت المنفذة

| اختيار المستخدم | مدخل الفيديو الأولي | مدخل الصوت المحلي | ناتج الإنهاء |
|---|---|---|---|
| بلا صوت | WebM فيديو فقط | لا يوجد | WebM فيديو فقط بعد `ffprobe` |
| ميكروفون فقط | WebM مع Track ميكروفون | لا يوجد | WebM يحوي Track الصوت الأصلي بعد `ffprobe` |
| صوت النظام فقط | WebM فيديو فقط | WAV من WASAPI | WebM جديد يحوي فيديو من المصدر وOpus من WAV |
| صوت النظام + ميكروفون | WebM مع Track ميكروفون | WAV من WASAPI | WebM جديد يحوي فيديو من المصدر وOpus ناتج `amix` للمصدرين |

لا يمرر مسار Electron صوت سطح المكتب من `getUserMedia`؛ يعطل هذا المسار صراحةً ويبقى صوت النظام معتمداً على WASAPI. لا تزال نسخة المتصفح خارج Electron fallback تطويرياً فقط ولا تمثل منتج Windows المعبأ.

## 3. عملية الإنهاء والتحقق

يمتلك backend قائمة معاملات FFmpeg ثابتة يبنيها من مسارات الملفات التي أنشأها التطبيق. لا يتلقى أوامر shell أو filters نصية من واجهة React. ينسخ الفيديو (`-c:v copy`) ويشفّر الصوت إلى Opus. مع وجود mic وWASAPI معاً، يستدعي filter المحدد داخلياً:

```text
[0:a:0][1:a:0]amix=inputs=2:duration=longest:dropout_transition=0[aout]
```

ثم يضع `-shortest` لمنع امتداد ناتج أطول من أقصر stream عند الإنهاء. يكتب FFmpeg أولاً ملفاً مؤقتاً بامتداد WebM معروف، ويشغّل `ffprobe` بصيغة JSON، ولا ينقل الملف إلى اسم التسجيل النهائي إلا إذا ثبت وجود stream فيديو وstream صوت. يبقى ملف WAV الجانبي في المكتبة كأصل قابل للفحص، بينما يسجل الحقل `systemAudioMuxed: true` أن ملف الفيديو النهائي يحوي صوت النظام فعلاً.

يتحقق `scripts/ffmpeg-runtime-smoke.cjs` من binary المضمّن بشكل تشغيلي: ينشئ فيديو VP9 بحجم 640×360، ينشئ WAV 48 kHz، يدمجهما إلى WebM، ثم يثبت `ffprobe` وجود VP9 وOpus و48 kHz وقناة صوت. هذا اختبار backend للوسائط، لا قياس لتسجيل سطح مكتب أو قياس A/V طويل.

## 4. runtime والتغليف والترخيص

يبني `npm run build:ffmpeg` runtime محلياً من ملف Windows x64 **LGPL** التالي، ويقارن SHA-256 قبل فك الضغط. لا يحتفظ Git بالملفات الثنائية أو الـ cache؛ يعيد script البناء استخراجها من المصدر المحدد.

| الخاصية | القيمة |
|---|---|
| المصدر | `BtbN/FFmpeg-Builds`، إصدار `autobuild-2026-08-23-13-03`، ملف `ffmpeg-n9.0.1-6-g9d4ca21220-win64-lgpl-9.0.zip` |
| SHA-256 للـ archive | `96ee3965c8f8ba3210e59374c8b1c58f7c9552ea877d930f3fb63fac94fefcec` |
| النسخة/السطر الفعلي | محفوظ في `desktop/ffmpeg/runtime/manifest.json` وقت البناء |
| الثنائيات | `ffmpeg.exe` و`ffprobe.exe` |
| موضع الحزمة | `resources/app.asar.unpacked/desktop/ffmpeg/runtime/` |
| آلية الحماية | `build-runtime.ps1` يتحقق من hash، و`verify:release` يرفض runtime مفقوداً أو محبوساً داخل ASAR |

ينص FFmpeg على أن الترخيص الافتراضي LGPLv2.1 أو أحدث، مع احتمال تحول الشروط إلى GPL عندما تتضمن البنية مكونات GPL اختيارية؛ لذلك اختير variant `lgpl` واحتُفظ بملف الترخيص المستخرج وبيانات المصدر/binary hash. تتطلب أي عملية توزيع تجاري لاحقة مراجعة قانونية مستقلة، ومصدر FFmpeg نفسه يصرح أن إرشاداته القانونية ليست نصيحة قانونية.[1]

## 5. القيود الصريحة

لا توجد حتى الآن معايرة clock أو تعويض انحراف timebase بين `MediaRecorder` وWASAPI، ولا قياس 5 أو 30 أو 60 دقيقة. التوقيت الحالي هو ترتيب بدء/إيقاف عملي ثم `-shortest`، وليس دليلاً على حد انحراف محدد. لا يوجد gain أو mute أو meter أو DSP حقيقيان للمصادر بعد، ولا export studio يتيح MP4 أو MKV. لا يُسمح بعبارة «A/V sync PASS» إلا بعد قياسات جلسات حقيقية وتسجيل نتائجها.

كما أن تثبيت وجود encoder في قائمة FFmpeg لا يثبت قابلية تشغيل hardware encoder على العتاد المحدد. تعرض القدرة فقط بعد استدعاء `ffmpeg -encoders`، ويجب أن يختبر مسار export لاحقاً encoder المختار بناتج حقيقي.

## المراجع

[1]: https://ffmpeg.org/legal.html "FFmpeg License and Legal Considerations"
[2]: https://ffmpeg.org/download.html "FFmpeg Download — Windows executable providers"
[3]: https://github.com/BtbN/FFmpeg-Builds "BtbN FFmpeg Builds — LGPL and Windows build variants"
