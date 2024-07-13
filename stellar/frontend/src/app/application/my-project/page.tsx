'use client'

import MyProjectHeader from '@/app/components/pages/application/my-project/MyProjectHeader'
import MyProjectLayout from '@/app/components/pages/application/my-project/MyProjectLayout'
import MyProjectSection from '@/app/components/pages/application/my-project/MyProjectSection'
import React from 'react'

const MyProjectPage = () => {
	return (
		<MyProjectLayout>
			<MyProjectHeader />
			<MyProjectSection />
		</MyProjectLayout>
	)
}

export default MyProjectPage
