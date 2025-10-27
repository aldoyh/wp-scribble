import React from 'react';

import Footer from '../components/footer/footer.jsx';
import Scribbble from '../components/logo/scribbble.jsx';

export default function Email(props) {
	let { to } = props;

	return (
		<div>
			<section
				className="relative grid min-h-screen font-sans bg-white dark:bg-gray-900 items-x-center"
				style={{ gridTemplate: '2fr auto 3fr / 100%' }}
			>
				<div className="p-8" style={{ gridRow: 2 }}>
					<div className="flex flex-col items-center w-full max-w-sm">
						<h1 className="mx-auto text-6xl text-gray-700 dark:text-gray-200">
							<Scribbble />
						</h1>

						<p className="inline-flex items-baseline mt-4 text-gray-400 dark:text-gray-500">
							<span className="text-center">تم إرسال بريد إلكتروني يحتوي على رابط تسجيل الدخول إلى {to}</span>
						</p>
					</div>
				</div>
			</section>
			<Footer />
		</div>
	);
}
