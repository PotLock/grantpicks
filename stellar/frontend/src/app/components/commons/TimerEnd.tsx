import { useEffect } from 'react'
import { useTimer } from 'react-timer-hook'

const TimerEnd = ({
	expiryTime,
	running,
}: {
	expiryTime: number
	running: boolean
}) => {
	const {
		totalSeconds,
		seconds,
		minutes,
		hours,
		days,
		isRunning,
		start,
		pause,
		resume,
		restart,
	} = useTimer({
		expiryTimestamp: new Date(expiryTime),
		onExpire: () => console.warn('onExpire called'),
		autoStart: false,
	})

	useEffect(() => {
		if (running) {
			start()
		}
	}, [])

	return (
		<>
			{days}d: {hours}h: {minutes}m: {seconds}s{` `}
		</>
	)
}

export default TimerEnd
