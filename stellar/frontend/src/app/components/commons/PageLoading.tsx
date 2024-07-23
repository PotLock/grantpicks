import React from 'react'
import IconLoading from '../svgs/IconLoading'

const PageLoading = ({ isOpen }: { isOpen: boolean }) => {
	if (!isOpen) return null
	return (
		<div className="fixed inset-0 bg-black/15 h-screen w-screen flex items-center justify-center">
			<IconLoading size={32} className="fill-grantpicks-black-600" />
		</div>
	)
}

export default PageLoading
