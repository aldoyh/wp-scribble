import React from 'react';
import Footer from '../components/footer/footer.jsx';
import Scribbble from '../components/logo/scribbble.jsx';
import ChevronUp from '../icons/chevron-up.jsx';
import ChevronDown from '../icons/chevron-down.jsx';

export default function Home() {
	// Removed h-full overflow-y-auto, and scrollBehavior:smooth of outer div
	// Chrome 87 is bugging and showing 2 scrollbars when added

	return (
		<div className="w-full">
			<section
				id="home"
				className="grid min-h-screen grid-cols-1 grid-rows-2 bg-white dark:bg-gray-900 row-2-auto col-1-full items-x-center items-y-center"
			>
				<div className="flex flex-col items-center">
					<h1 className="text-5xl text-gray-700 dark:text-gray-200 md:text-6xl xl:text-8xl">
						<Scribbble />
					</h1>
					<h2 className="w-full max-w-lg mt-4 font-serif text-lg font-medium text-center text-gray-400 dark:text-gray-400 xl:mt-6">
						اكتب فكرتك. احكِ قصتك.
						<br />
						شارك معرفتك.
					</h2>
					<a
						href="login"
						className="px-16 py-4 mt-16 font-sans font-semibold tracking-wide text-center text-white bg-blue-500 rounded-md xl:mt-24 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-50 hover:bg-blue-600 transition-colors dark:bg-blue-600 dark:hover:bg-blue-700"
					>
						ابدأ الكتابة
					</a>
				</div>
				<a
					href="#writing"
					className="w-8 h-8 mx-8 mt-0 mb-24 text-gray-300 dark:text-gray-600 cursor-pointer sm:mb-8 animate-bounce"
				>
					<span className="sr-only">التالي</span>
					<ChevronDown />
				</a>
			</section>
			<section
				id="writing"
				className="grid min-h-screen grid-cols-1 grid-rows-2 border-t border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 row-2-auto col-1-full items-x-center items-y-center"
			>
				<div className="grid grid-cols-1 gap-8 p-8 xl:p-16 items-y-center items-x-center col-1-full xl:grid-flow-col xl:grid-cols-none xl:grid-rows-1 xl:row-1-full">
					<div className="max-w-sm m-8 text-center">
						<h3 className="font-serif text-2xl font-medium text-gray-700 dark:text-gray-200">الكتابة</h3>
						<p className="font-sans text-gray-400 dark:text-gray-400">
							سكريبل هي أداة كتابة بسيطة. إنها تبتعد عن طريقك وتتيح لك التركيز
							على الكتابة. استخدم Markdown للتنسيق والصور وكتل الأكواد. راقب المعاينة مع
							التحديثات المباشرة.
						</p>
					</div>
					<div>
						<img
							className="border-gray-200 dark:border-gray-700 shadow-md sm:max-w-md md:shadow-xl md:border md:rounded xl:max-w-50vmin xl:max-h-50vmin"
							src="../banner-1.png"
							alt="الكتابة"
						/>
					</div>
				</div>
				<a href="#reading" className="w-8 h-8 m-8 mt-0 text-gray-300 dark:text-gray-600 cursor-pointer">
					<span className="sr-only">التالي</span>
					<ChevronDown />
				</a>
			</section>
			<section
				id="reading"
				className="grid min-h-screen grid-cols-1 grid-rows-2 bg-white dark:bg-gray-900 row-2-auto col-1-full items-x-center items-y-center"
			>
				<div className="grid grid-cols-1 gap-8 p-8 xl:p-16 items-y-center items-x-center col-1-full xl:grid-flow-col xl:grid-cols-none xl:grid-rows-1 xl:row-1-full">
					<div className="max-w-sm m-8 text-center xl:col-start-2">
						<h3 className="font-serif text-2xl font-medium text-gray-700 dark:text-gray-200">القراءة</h3>
						<p className="font-sans text-gray-400 dark:text-gray-400">
							شارك روابط منشوراتك مع الآخرين ليستمتعوا بها. كل محتواك متاح أيضًا
							في الوضع الداكن، والصفحات الثابتة تجعله سريعًا للغاية.
						</p>
					</div>
					<div className="relative">
						<img
							className="border-gray-200 dark:border-gray-700 shadow-md sm:max-w-md md:shadow-xl md:border md:rounded xl:max-w-50vmin xl:max-h-50vmin"
							style={{ transform: 'translate(-15%, -15%) scale(0.7) ' }}
							src="../banner-2.png"
							alt="القراءة - الوضع الفاتح"
						/>
						<img
							className="absolute inset-0 border-gray-200 dark:border-gray-700 shadow-md sm:max-w-md md:shadow-xl md:border md:rounded xl:max-w-50vmin xl:max-h-50vmin"
							style={{ transform: 'translate(15%, 15%) scale(0.7) ' }}
							src="../banner-3.png"
							alt="القراءة - الوضع الداكن"
						/>
					</div>
				</div>
				<a href="#profile" className="w-8 h-8 m-8 mt-0 text-gray-300 dark:text-gray-600 cursor-pointer">
					<span className="sr-only">التالي</span>
					<ChevronDown />
				</a>
			</section>
			<section
				id="profile"
				className="grid min-h-screen grid-cols-1 grid-rows-2 border-t border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 row-2-auto col-1-full items-x-center items-y-center"
			>
				<div className="grid grid-cols-1 gap-8 p-8 xl:p-16 items-y-center items-x-center col-1-full xl:grid-flow-col xl:grid-cols-none xl:grid-rows-1 xl:row-1-full">
					<div className="max-w-sm m-8 text-center">
						<h3 className="font-serif text-2xl font-medium text-gray-700 dark:text-gray-200">الملف الشخصي</h3>
						<p className="font-sans text-gray-400 dark:text-gray-400">
							شارك رابط ملفك الشخصي حتى يتمكن الآخرون من قراءة جميع قصصك. يتوفر موجز
							الملف الشخصي لكل من يحب قراءة كل قصة جديدة تكتبها.
						</p>
					</div>
					<div>
						<img
							className="border-gray-200 dark:border-gray-700 shadow-md sm:max-w-md md:shadow-xl md:border md:rounded xl:max-w-50vmin xl:max-h-50vmin"
							src="../banner-4.png"
							alt="الملف الشخصي"
						/>
					</div>
				</div>
				<a href="#dashboard" className="w-8 h-8 m-8 mt-0 text-gray-300 dark:text-gray-600 cursor-pointer">
					<span className="sr-only">التالي</span>
					<ChevronDown />
				</a>
			</section>
			<section
				id="dashboard"
				className="grid min-h-screen grid-cols-1 grid-rows-2 bg-white dark:bg-gray-900 row-2-auto col-1-full items-x-center items-y-center"
			>
				<div className="grid grid-cols-1 gap-8 p-8 xl:p-16 items-y-center items-x-center col-1-full xl:grid-flow-col xl:grid-cols-none xl:grid-rows-1 xl:row-1-full">
					<div className="max-w-sm m-8 text-center xl:col-start-2">
						<h3 className="font-serif text-2xl font-medium text-gray-700 dark:text-gray-200">لوحة التحكم</h3>
						<p className="font-sans text-gray-400 dark:text-gray-400">
							انشر منشوراتك أو ألغِ نشرها. أضف لمسة شخصية بصورة ملف شخصي مخصصة. وإذا
							قررت يومًا مغادرة سكريبل، يمكنك تصدير جميع بياناتك وأخذ كل شيء
							معك.
						</p>
					</div>
					<div>
						<img
							className="border-gray-200 dark:border-gray-700 shadow-md sm:max-w-md md:shadow-xl md:border md:rounded xl:max-w-50vmin xl:max-h-50vmin"
							src="../banner-5.png"
							alt="لوحة التحكم"
						/>
					</div>
				</div>
				<a href="#home" className="w-8 h-8 m-8 mt-0 text-gray-300 dark:text-gray-600 cursor-pointer">
					<span className="sr-only">الذهاب للأعلى</span>
					<ChevronUp />
				</a>
			</section>

			<Footer />
		</div>
	);
}
