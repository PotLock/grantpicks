import React from 'react'

const BaseLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<main className="max-w-[2560px] min-h-screen h-full font-titillium-web relative m-0 p-0 bg-white">
			{children}
		</main>
	)
}

export default BaseLayout
