import { IconProps } from '@/types/icon'
import React from 'react'

const IconDollar = ({ size, className, onClick }: IconProps) => {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 18 18"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
		>
			<g id="Icon/dollar">
				<path
					id="Union"
					fillRule="evenodd"
					clipRule="evenodd"
					d="M15 9C15 12.3137 12.3137 15 9 15C5.68629 15 3 12.3137 3 9C3 5.68629 5.68629 3 9 3C12.3137 3 15 5.68629 15 9ZM16.5 9C16.5 13.1421 13.1421 16.5 9 16.5C4.85786 16.5 1.5 13.1421 1.5 9C1.5 4.85786 4.85786 1.5 9 1.5C13.1421 1.5 16.5 4.85786 16.5 9ZM9.06625 4.12505C9.37688 4.12927 9.62527 4.38451 9.62105 4.69514L9.60774 5.67464C9.87325 5.71428 10.116 5.78456 10.3359 5.88548C10.7003 6.05167 10.9837 6.28285 11.1861 6.57901C11.2601 6.68735 11.321 6.80196 11.3689 6.92284C11.5106 7.28132 11.1834 7.60813 10.7979 7.60813C10.4432 7.60813 10.1719 7.29542 9.90748 7.05898C9.88735 7.04098 9.8661 7.02375 9.84374 7.00728C9.76973 6.95279 9.68563 6.9087 9.59143 6.875L9.56985 8.46392L9.62641 8.47745C9.91192 8.54137 10.174 8.6266 10.4126 8.73313C10.6513 8.83967 10.8579 8.9707 11.0327 9.12624C11.2074 9.28178 11.3427 9.46502 11.4386 9.67596C11.5366 9.8869 11.5866 10.1287 11.5888 10.4015C11.5866 10.802 11.4844 11.1493 11.2819 11.4434C11.0817 11.7353 10.7919 11.9622 10.4126 12.1241C10.1514 12.2348 9.85295 12.3071 9.51717 12.3412L9.50386 13.3201C9.49964 13.6308 9.2444 13.8792 8.93377 13.8749C8.62314 13.8707 8.37475 13.6155 8.37897 13.3049L8.39239 12.3171C8.12916 12.2773 7.88745 12.2119 7.66725 12.1209C7.27733 11.959 6.97264 11.7193 6.75318 11.4018C6.6519 11.2529 6.57306 11.0875 6.51666 10.9057C6.40292 10.539 6.72713 10.2161 7.11106 10.2161H7.16084C7.49269 10.2161 7.73919 10.5008 7.93891 10.7658C8.05183 10.9107 8.20205 11.0204 8.38955 11.095L8.40889 11.1022L8.43179 9.41733L8.36718 9.4011C7.81533 9.26687 7.3796 9.057 7.06 8.77148C6.7404 8.48597 6.58166 8.10138 6.58379 7.61772C6.58166 7.22141 6.68713 6.87518 6.9002 6.57901C7.1154 6.28285 7.4105 6.05167 7.7855 5.88548C8.00097 5.78998 8.23332 5.72193 8.48255 5.6813L8.49615 4.67986C8.50038 4.36923 8.75561 4.12083 9.06625 4.12505ZM8.12428 7.1479C8.20447 7.04098 8.31839 6.95688 8.46605 6.8956L8.44912 8.14135C8.39717 8.11549 8.34855 8.08796 8.30325 8.05877C8.20737 7.99485 8.13173 7.91921 8.07634 7.83185C8.02307 7.7445 7.99857 7.64222 8.00283 7.52503C8.00283 7.38441 8.04331 7.2587 8.12428 7.1479ZM9.5335 11.1387L9.55278 9.71989C9.59887 9.7368 9.64259 9.75412 9.68394 9.77184C9.85013 9.84215 9.97584 9.92738 10.0611 10.0275C10.1484 10.1277 10.1921 10.2512 10.1921 10.3983C10.1921 10.5559 10.1442 10.6955 10.0483 10.8169C9.9524 10.9384 9.8171 11.0332 9.64239 11.1014C9.60737 11.1152 9.57107 11.1277 9.5335 11.1387Z"
				/>
			</g>
		</svg>
	)
}

export default IconDollar
