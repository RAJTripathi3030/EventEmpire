import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Carousel } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// Import local assets for offline capability
import heroWedding from '../assets/hero_wedding.gif';
import heroParty from '../assets/hero_party.gif';
import heroGraduation from '../assets/hero_graduation.gif';
import momentCorporate from '../assets/moment_corporate.jpg';
import momentBirthday from '../assets/moment_birthday.jpg';
import momentReception from '../assets/moment_reception.jpg';
import momentStage from '../assets/moment_stage.jpg';
import momentWeddingVideo from '../assets/moment_wedding.mp4';
import momentConcertVideo from '../assets/moment_concert.mp4';
import momentFestivalVideo from '../assets/moment_festival.mp4';
import ctaCelebration from '../assets/cta_celebration.gif';

const Home = () => {
    const [stats, setStats] = useState({ users: 0, vendors: 0, events: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/stats');
                setStats(res.data);
            } catch (err) {
                console.error('Error fetching stats:', err);
                setStats({ users: 120, vendors: 45, events: 300 });
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="d-flex flex-column min-vh-100 overflow-hidden">
            {/* Hero Carousel with Celebration GIFs */}
            <div className="position-relative" style={{ height: '100vh', marginTop: '-80px' }}>
                <Carousel fade interval={4000} controls={false} indicators={true} className="h-100">
                    {[
                        {
                            image: heroWedding,
                            title: "Stunning Weddings",
                            subtitle: "Create the royal celebration you've always imagined."
                        },
                        {
                            image: heroParty,
                            title: "Vibrant Parties",
                            subtitle: "From birthdays to farewells, make every moment count."
                        },
                        {
                            image: heroGraduation,
                            title: "Graduation Galas",
                            subtitle: "Celebrate milestones with elegance and style."
                        }
                    ].map((slide, idx) => (
                        <Carousel.Item key={idx} className="h-100">
                            <div
                                style={{
                                    height: '100vh',
                                    backgroundImage: `url("${slide.image}")`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                }}
                            >
                                <div className="position-absolute top-0 start-0 w-100 h-100" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.7))' }}></div>
                                <div className="d-flex align-items-center justify-content-center h-100 position-relative">
                                    <div className="text-center text-white p-4">
                                        <h1 className="display-1 fw-bold mb-3 animate-fade-in text-shadow-lg" style={{ fontFamily: 'Playfair Display' }}>
                                            {slide.title}
                                        </h1>
                                        <p className="lead fs-2 mb-5 animate-fade-in animate-delay-1 text-light">
                                            {slide.subtitle}
                                        </p>
                                        <div className="d-flex justify-content-center gap-3 animate-fade-in animate-delay-2">
                                            <Link to="/register" className="btn-royal-gold px-5 py-3 fs-5 text-decoration-none shadow-lg">
                                                Start Planning Free
                                            </Link>
                                            <Link to="/login" className="btn-glass px-5 py-3 fs-5 text-decoration-none shadow-lg text-white border-white">
                                                Explore Features
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Carousel.Item>
                    ))}
                </Carousel>
            </div>

            {/* Floating Stats */}
            <Container style={{ marginTop: '-80px', position: 'relative', zIndex: 10 }}>
                <Row className="g-4 justify-content-center">
                    {[
                        { count: stats.events, label: 'Events Planned', icon: 'bi-calendar2-week' },
                        { count: stats.vendors, label: 'Trusted Vendors', icon: 'bi-stars' },
                        { count: stats.users, label: 'Happy Hosts', icon: 'bi-heart-fill' }
                    ].map((stat, idx) => (
                        <Col md={4} key={idx}>
                            <div className="glass-card text-center h-100 py-4 bg-white border-0 shadow-lg" style={{ borderRadius: '20px' }}>
                                <div className="display-4 mb-2" style={{ color: 'var(--gold-accent)' }}>
                                    <i className={`bi ${stat.icon}`}></i>
                                </div>
                                <h2 className="fw-bold" style={{ color: 'var(--text-primary)' }}>{stat.count}+</h2>
                                <p className="text-muted fw-bold text-uppercase small letter-spacing-1">{stat.label}</p>
                            </div>
                        </Col>
                    ))}
                </Row>
            </Container>

            {/* Key Features Section */}
            <section className="py-5 my-5">
                <Container>
                    <div className="text-center mb-5">
                        <h2 className="display-4 fw-bold mb-3" style={{ color: 'var(--text-primary)', fontFamily: 'Playfair Display' }}>Everything You Need, All in One Place</h2>
                        <p className="fs-5 text-muted mx-auto" style={{ maxWidth: '700px' }}>From budgets to guest lists, vendor booking to timeline management—EventEmpire streamlines every aspect of event planning.</p>
                    </div>

                    <Row className="g-4">
                        {[
                            { icon: 'bi-calendar-check', title: 'Event Creation', desc: 'Create events with name, date, time, location, and type. Edit or delete as needed with full control.' },
                            { icon: 'bi-cash-coin', title: 'Budget Tracking', desc: 'Set budgets and track expenses in real-time. Get alerts when approaching limits. Add categories like venue, catering, decorations.' },
                            { icon: 'bi-people', title: 'Guest Management', desc: 'Invite guests by email, view RSVP status, and send reminders. Keep everyone in the loop effortlessly.' },
                            { icon: 'bi-envelope-heart', title: 'Custom Invitations', desc: 'Create customized invitations and send them via email or social media. Track delivery and responses.' },
                            { icon: 'bi-shop', title: 'Vendor Search', desc: 'Search vendors by location, availability, and pricing. View details, services offered, and reviews.' },
                            { icon: 'bi-chat-dots', title: 'Communication Hub', desc: 'Centralized messaging with vendors and guests. Keep all conversations organized in one place.' }
                        ].map((feature, idx) => (
                            <Col md={4} key={idx}>
                                <div className="glass-card h-100 p-4 text-center hover-lift" style={{ transition: 'transform 0.3s ease' }}>
                                    <div className="display-4 mb-3" style={{ color: 'var(--gold-primary)' }}>
                                        <i className={feature.icon}></i>
                                    </div>
                                    <h4 className="fw-bold mb-3" style={{ color: 'var(--text-primary)' }}>{feature.title}</h4>
                                    <p className="text-muted">{feature.desc}</p>
                                </div>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>

            {/* How It Works - CLEANED UP */}
            <section className="py-5 bg-white">
                <Container>
                    <div className="text-center mb-5">
                        <h2 className="display-4 fw-bold mb-3" style={{ color: 'var(--text-primary)', fontFamily: 'Playfair Display' }}>How It Works</h2>
                        <p className="fs-5 text-muted">Get started in minutes with our simple 3-step process</p>
                    </div>

                    <Row className="align-items-center mb-5 g-5">
                        <Col md={6} className="order-md-1">
                            {/* Clean vector-style illustration */}
                            <div className="text-center p-5 bg-light rounded-4 shadow-lg">
                                <i className="bi bi-person-plus-fill display-1 mb-3" style={{ color: 'var(--gold-primary)' }}></i>
                                <h4 className="fw-bold" style={{ color: 'var(--text-primary)' }}>Simple Registration</h4>
                            </div>
                        </Col>
                        <Col md={6} className="order-md-2">
                            <div className="d-flex align-items-center mb-3">
                                <div className="display-3 fw-bold me-3" style={{ color: 'var(--gold-accent)' }}>1</div>
                                <h3 className="display-6 fw-bold mb-0" style={{ color: 'var(--gold-primary)' }}>Create Your Account</h3>
                            </div>
                            <p className="lead text-muted">
                                Sign up for free in under 30 seconds. No credit card required. Choose between planning your own event or offering services as a vendor.
                            </p>
                        </Col>
                    </Row>

                    <Row className="align-items-center mb-5 g-5">
                        <Col md={6} className="order-md-2">
                            <div className="text-center p-5 bg-light rounded-4 shadow-lg">
                                <i className="bi bi-calendar-event display-1 mb-3" style={{ color: 'var(--gold-primary)' }}></i>
                                <h4 className="fw-bold" style={{ color: 'var(--text-primary)' }}>Event Dashboard</h4>
                            </div>
                        </Col>
                        <Col md={6} className="order-md-1">
                            <div className="d-flex align-items-center mb-3">
                                <div className="display-3 fw-bold me-3" style={{ color: 'var(--gold-accent)' }}>2</div>
                                <h3 className="display-6 fw-bold mb-0" style={{ color: 'var(--gold-primary)' }}>Set Up Your Event</h3>
                            </div>
                            <p className="lead text-muted">
                                Add event details, create your budget, and build your guest list. Our smart dashboard adapts to your event type—weddings, birthdays, corporate events, and more.
                            </p>
                        </Col>
                    </Row>

                    <Row className="align-items-center g-5">
                        <Col md={6} className="order-md-1">
                            <div className="text-center p-5 bg-light rounded-4 shadow-lg">
                                <i className="bi bi-rocket-takeoff display-1 mb-3" style={{ color: 'var(--gold-primary)' }}></i>
                                <h4 className="fw-bold" style={{ color: 'var(--text-primary)' }}>Launch & Manage</h4>
                            </div>
                        </Col>
                        <Col md={6} className="order-md-2">
                            <div className="d-flex align-items-center mb-3">
                                <div className="display-3 fw-bold me-3" style={{ color: 'var(--gold-accent)' }}>3</div>
                                <h3 className="display-6 fw-bold mb-0" style={{ color: 'var(--gold-primary)' }}>Execute & Celebrate</h3>
                            </div>
                            <p className="lead text-muted">
                                Book vendors, track progress, and collaborate with your team. When the big day arrives, relax knowing every detail is handled.
                            </p>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Moments We've Created - Infinite Mixed-Media Carousel */}
            <section className="py-5 position-relative overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
                <div className="pattern-overlay"></div>
                <Container className="position-relative">
                    <div className="text-center mb-5">
                        <h2 className="display-4 fw-bold mb-3" style={{ color: 'var(--text-primary)', fontFamily: 'Playfair Display' }}>Moments We've Created</h2>
                        <p className="fs-5 text-muted">Real events, real celebrations, real memories</p>
                    </div>

                    {/* Mixed-Media Carousel with Swiper */}
                    <Swiper
                        modules={[Autoplay, Navigation, Pagination]}
                        spaceBetween={20}
                        slidesPerView={1}
                        loop={true}
                        autoplay={{
                            delay: 3000,
                            disableOnInteraction: false,
                        }}
                        navigation={true}
                        pagination={{ clickable: true }}
                        breakpoints={{
                            768: { slidesPerView: 2 },
                            1024: { slidesPerView: 3 },
                        }}
                        className="moments-carousel"
                    >
                        {[
                            { type: 'image', src: momentCorporate, title: 'Corporate Galas', subtitle: 'Professional events with impact' },
                            { type: 'video', src: momentWeddingVideo, title: 'Dream Weddings', subtitle: 'Unforgettable ceremonies' },
                            { type: 'image', src: momentBirthday, title: 'Birthday Celebrations', subtitle: 'Making milestones memorable' },
                            { type: 'video', src: momentConcertVideo, title: 'Live Concerts', subtitle: 'Energetic performances' },
                            { type: 'image', src: momentReception, title: 'Grand Receptions', subtitle: 'Elegant gatherings' },
                            { type: 'video', src: momentFestivalVideo, title: 'Festival Parties', subtitle: 'Vibrant celebrations' },
                            { type: 'image', src: momentStage, title: 'Stage Productions', subtitle: 'Theatrical excellence' },
                        ].map((moment, idx) => (
                            <SwiperSlide key={idx}>
                                <div className="moment-card position-relative overflow-hidden rounded-4 shadow-lg" style={{ height: '400px' }}>
                                    {moment.type === 'image' ? (
                                        <img
                                            src={moment.src}
                                            alt={moment.title}
                                            className="w-100 h-100 object-fit-cover"
                                            style={{ objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <video
                                            src={moment.src}
                                            className="w-100 h-100 object-fit-cover"
                                            style={{ objectFit: 'cover' }}
                                            autoPlay
                                            muted
                                            loop
                                            playsInline
                                        />
                                    )}
                                    <div className="moment-overlay position-absolute bottom-0 start-0 w-100 p-4" style={{
                                        background: 'linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent)',
                                        color: 'white'
                                    }}>
                                        <h4 className="fw-bold mb-1">{moment.title}</h4>
                                        <p className="mb-0 opacity-75">{moment.subtitle}</p>
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </Container>
            </section>

            {/* Testimonials */}
            <section className="py-5 my-5">
                <Container>
                    <div className="text-center mb-5">
                        <h2 className="display-4 fw-bold mb-3" style={{ color: 'var(--text-primary)', fontFamily: 'Playfair Display' }}>What Our Users Say</h2>
                        <p className="fs-5 text-muted">Join thousands of happy event planners</p>
                    </div>

                    <Row className="g-4">
                        {[
                            { name: 'Priya Sharma', role: 'Bride, Mumbai', text: 'EventEmpire made planning my wedding an absolute breeze. The budget tracker saved me from overspending, and I found the perfect vendors through their marketplace!', avatar: '👰' },
                            { name: 'Rajesh Kumar', role: 'Corporate Event Manager', text: 'Managing multiple company events used to be chaos. Now everything is organized in one place. The collaboration features are a game-changer!', avatar: '👨‍💼' },
                            { name: 'Anjali Patel', role: 'Birthday Mom, Delhi', text: 'Planned my daughter\'s sweet 16 using EventEmpire. The guest list management and RSVP tracking made everything so simple. Highly recommend!', avatar: '👩‍👧' }
                        ].map((testimonial, idx) => (
                            <Col md={4} key={idx}>
                                <div className="glass-card h-100 p-4">
                                    <div className="text-center mb-3">
                                        <div className="display-1 mb-2">{testimonial.avatar}</div>
                                        <h5 className="fw-bold mb-1" style={{ color: 'var(--text-primary)' }}>{testimonial.name}</h5>
                                        <p className="text-muted small mb-3">{testimonial.role}</p>
                                    </div>
                                    <p className="text-muted fst-italic">"{testimonial.text}"</p>
                                    <div className="text-warning">
                                        <i className="bi bi-star-fill"></i>
                                        <i className="bi bi-star-fill"></i>
                                        <i className="bi bi-star-fill"></i>
                                        <i className="bi bi-star-fill"></i>
                                        <i className="bi bi-star-fill"></i>
                                    </div>
                                </div>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>

            {/* Final CTA */}
            <section className="py-5 text-center position-relative overflow-hidden" style={{
                background: 'linear-gradient(135deg, var(--gold-accent) 0%, var(--gold-primary) 100%)',
                backgroundImage: `url(${ctaCelebration})`,
                backgroundSize: 'cover',
                backgroundBlendMode: 'overlay'
            }}>
                <div className="position-absolute top-0 start-0 w-100 h-100" style={{ background: 'rgba(212, 175, 55, 0.9)' }}></div>
                <Container className="position-relative py-5">
                    <h2 className="display-3 fw-bold text-white mb-4" style={{ fontFamily: 'Playfair Display' }}>Ready to Plan Your Dream Event?</h2>
                    <p className="fs-4 text-white mb-5">Join 300+ successful events planned on EventEmpire</p>
                    <Link to="/register" className="btn btn-light btn-lg px-5 py-3 fs-5 shadow-lg" style={{
                        color: 'var(--gold-primary)',
                        fontWeight: '700',
                        border: 'none'
                    }}>
                        Get Started Free <i className="bi bi-arrow-right ms-2"></i>
                    </Link>
                </Container>
            </section>

            {/* Fat Footer */}
            <footer className="bg-dark text-white pt-5 pb-4">
                <Container>
                    <Row className="g-4">
                        {/* Company Info */}
                        <Col lg={4} md={6}>
                            <h3 className="mb-4" style={{ fontFamily: 'Playfair Display', color: 'var(--gold-primary)' }}>EventEmpire</h3>
                            <p className="text-white-50 mb-3">
                                Your all-in-one platform for stress-free event planning. From intimate gatherings to grand celebrations, we help you create unforgettable moments.
                            </p>
                            <div className="d-flex gap-3">
                                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-white fs-4 hover-gold">
                                    <i className="bi bi-instagram"></i>
                                </a>
                                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-white fs-4 hover-gold">
                                    <i className="bi bi-facebook"></i>
                                </a>
                                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-white fs-4 hover-gold">
                                    <i className="bi bi-twitter"></i>
                                </a>
                                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-white fs-4 hover-gold">
                                    <i className="bi bi-linkedin"></i>
                                </a>
                            </div>
                        </Col>

                        {/* Quick Links */}
                        <Col lg={2} md={6}>
                            <h5 className="mb-4 fw-bold text-uppercase" style={{ color: 'var(--gold-accent)' }}>Quick Links</h5>
                            <ul className="list-unstyled">
                                <li className="mb-2"><Link to="/" className="text-white-50 text-decoration-none hover-gold">Home</Link></li>
                                <li className="mb-2"><Link to="/register" className="text-white-50 text-decoration-none hover-gold">Sign Up</Link></li>
                                <li className="mb-2"><Link to="/login" className="text-white-50 text-decoration-none hover-gold">Login</Link></li>
                                <li className="mb-2"><Link to="/find-vendors" className="text-white-50 text-decoration-none hover-gold">Find Vendors</Link></li>
                            </ul>
                        </Col>

                        {/* Resources */}
                        <Col lg={2} md={6}>
                            <h5 className="mb-4 fw-bold text-uppercase" style={{ color: 'var(--gold-accent)' }}>Resources</h5>
                            <ul className="list-unstyled">
                                <li className="mb-2"><a href="#features" className="text-white-50 text-decoration-none hover-gold">Features</a></li>
                                <li className="mb-2"><a href="#pricing" className="text-white-50 text-decoration-none hover-gold">Pricing</a></li>
                                <li className="mb-2"><a href="#blog" className="text-white-50 text-decoration-none hover-gold">Blog</a></li>
                                <li className="mb-2"><a href="#help" className="text-white-50 text-decoration-none hover-gold">Help Center</a></li>
                            </ul>
                        </Col>

                        {/* Legal */}
                        <Col lg={2} md={6}>
                            <h5 className="mb-4 fw-bold text-uppercase" style={{ color: 'var(--gold-accent)' }}>Legal</h5>
                            <ul className="list-unstyled">
                                <li className="mb-2"><a href="#privacy" className="text-white-50 text-decoration-none hover-gold">Privacy Policy</a></li>
                                <li className="mb-2"><a href="#terms" className="text-white-50 text-decoration-none hover-gold">Terms of Service</a></li>
                                <li className="mb-2"><a href="#cookies" className="text-white-50 text-decoration-none hover-gold">Cookie Policy</a></li>
                                <li className="mb-2"><a href="#gdpr" className="text-white-50 text-decoration-none hover-gold">GDPR</a></li>
                            </ul>
                        </Col>

                        {/* Contact */}
                        <Col lg={2} md={6}>
                            <h5 className="mb-4 fw-bold text-uppercase" style={{ color: 'var(--gold-accent)' }}>Contact</h5>
                            <ul className="list-unstyled text-white-50">
                                <li className="mb-2"><i className="bi bi-envelope me-2"></i>hello@eventempire.com</li>
                                <li className="mb-2"><i className="bi bi-telephone me-2"></i>+91 98765 43210</li>
                                <li className="mb-2"><i className="bi bi-geo-alt me-2"></i>Mumbai, India</li>
                            </ul>
                        </Col>
                    </Row>

                    <hr className="my-4 border-secondary" />

                    <Row>
                        <Col md={6} className="text-center text-md-start">
                            <p className="mb-0 text-white-50">&copy; 2024 EventEmpire. All rights reserved. Designing memories, one event at a time.</p>
                        </Col>
                        <Col md={6} className="text-center text-md-end">
                            <p className="mb-0 text-white-50">Made with <i className="bi bi-heart-fill text-danger"></i> in India</p>
                        </Col>
                    </Row>
                </Container>
            </footer>
        </div>
    );
};

export default Home;
