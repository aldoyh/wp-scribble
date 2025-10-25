import React, { useEffect } from 'react';
import Error from './error.jsx';

export default function NotFound() {
	useEffect(() => {
		document.title = 'غير موجود - سكريبل';

		return () => {
			document.title = 'سكريبل';
		};
	}, []);

	return <Error title="404" description="الصفحة غير موجودة" />;
}
