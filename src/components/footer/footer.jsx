import logo from '../assets/eqw 1.png'
export default function FooterNode() {
    return(
        <footer>
            <div className="footer-container">
                <a href='/' className="footer-logo-link">
                    <img src={logo} className='footer-logo' alt="" />
                </a>
                <div className="text-container">
                    <div className="text">
                        г. Москва, Цветной б-р, 40
                        +7 495 771 21 11
                        info@skan.ru
                    </div>
                    <div className="copyright">Copyright. 2022</div>
                </div>
            </div>
        </footer>
    )
}