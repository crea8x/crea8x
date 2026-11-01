const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-brand">Crea<span className="logo-infinity">∞</span>X</div>
            <p>Where creators connect, collaborate & build the future.</p>
            <p style={{ marginTop: '8px', opacity: 0.6 }}>© {new Date().getFullYear()} Crea8X. All rights reserved.</p>
        </footer>
    );
};

export default Footer;
