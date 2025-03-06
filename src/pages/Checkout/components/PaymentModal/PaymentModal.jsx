import React, { useState } from 'react';
import './PaymentModal.css';
import { FaTimes } from 'react-icons/fa';
import { FiChevronRight } from 'react-icons/fi';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { string, object, boolean } from 'yup';
import QRCode from 'react-qr-code';
// Icon assets
const artWaveIcon = '/assets/icons/logo.png';
const googlePayIcon = '/assets/icons/google-pay.png';
const phonepeIcon = '/assets/icons/phonepe.png';
const paytmIcon = '/assets/icons/paytm.png';
const visaIcon = '/assets/icons/visa.webp';
const mastercardIcon = '/assets/icons/mastercard.webp';
const rupayIcon = '/assets/icons/rupay.png';
const sbiIcon = '/assets/icons/sbi.jpg';
const iciciIcon = '/assets/icons/icici.png';
const axisIcon = '/assets/icons/axis.webp';
const hdfcIcon = '/assets/icons/hdfc.png';
const razorpayLogo = '/assets/icons/razorpay.png';

// Validation schemas for different payment methods
const cardValidationSchema = object({
    cardNumber: string()
        .required('Card number is required')
        .test(
            'is-valid-card',
            'Please enter a valid 16-digit card number',
            value => value && value.replace(/\s/g, '').length === 16 && /^\d+$/.test(value.replace(/\s/g, ''))
        ),
    cardName: string()
        .required('Name on card is required')
        .min(3, 'Name must be at least 3 characters'),
    expiryDate: string()
        .required('Expiry date is required')
        .matches(/^\d{2}\/\d{2}$/, 'Expiry date must be in MM/YY format')
        .test(
            'is-valid-expiry',
            'Card has expired',
            value => {
                if (!value || !/^\d{2}\/\d{2}$/.test(value)) return false;
                const [month, year] = value.split('/');
                const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
                return expiryDate > new Date();
            }
        ),
    cvv: string()
        .required('CVV is required')
        .matches(/^\d{3,4}$/, 'CVV must be 3 or 4 digits'),
    saveCard: boolean()
});

const upiValidationSchema = object({
    upiId: string()
        .required('UPI ID is required')
        .matches(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/, 'Please enter a valid UPI ID (e.g., username@upi)')
});

const netbankingValidationSchema = object({
    selectedBank: string()
        .required('Please select a bank')
});

const PaymentModal = ({ isOpen, onClose, amount, onPaymentSuccess, customerInfo }) => {
    const [activeTab, setActiveTab] = useState('recommended');
    const [loading, setLoading] = useState(false);
    const [activePaymentMethod, setActivePaymentMethod] = useState('');
    const [selectedBank, setSelectedBank] = useState('');

    if (!isOpen) return null;

    // Format card number with spaces
    const formatCardNumber = (value) => {
        if (!value) return value;
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = (matches && matches[0]) || '';
        const parts = [];

        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }

        if (parts.length) {
            return parts.join(' ');
        } else {
            return value;
        }
    };

    // Format expiry date
    const formatExpiryDate = (value) => {
        if (!value) return value;
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');

        if (v.length >= 3) {
            return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
        }

        return v;
    };

    // Detect card type based on number
    const detectCardType = (cardNumber) => {
        const cleanNumber = cardNumber.replace(/\s/g, '');

        if (cleanNumber.startsWith('4')) {
            return 'visa';
        } else if (/^5[1-5]/.test(cleanNumber)) {
            return 'mastercard';
        } else if (/^(6|8)/.test(cleanNumber)) {
            return 'rupay';
        } else {
            return 'unknown';
        }
    };

    const handlePaymentSubmit = (values, { setSubmitting }) => {
        setLoading(true);

        // Simulate payment processing
        setTimeout(() => {
            setLoading(false);
            setSubmitting(false);

            onPaymentSuccess({
                razorpay_payment_id: 'pay_' + Math.random().toString(36).substr(2, 9),
                method: activePaymentMethod,
                saved_card: activePaymentMethod === 'card' ? values.saveCard : false,
                ...values
            });

            onClose();
        }, 2000);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    // Get initial values and validation schema based on payment method
    const getInitialValues = () => {
        switch (activePaymentMethod) {
            case 'card':
                return {
                    cardNumber: '',
                    cardName: '',
                    expiryDate: '',
                    cvv: '',
                    saveCard: false
                };
            case 'upi':
                return {
                    upiId: ''
                };
            case 'netbanking':
                return {
                    selectedBank: selectedBank
                };
            default:
                return {};
        }
    };

    const getValidationSchema = () => {
        switch (activePaymentMethod) {
            case 'card':
                return cardValidationSchema;
            case 'upi':
                return upiValidationSchema;
            case 'netbanking':
                return netbankingValidationSchema;
            default:
                return object({});
        }
    };

    return (
        <div className="payment-modal-overlay">
            <div className="payment-modal">
                <div className="payment-modal-container">
                    {/* Left Section */}
                    <div className="payment-modal-left">
                        <div className="payment-brand">
                            <div className="brand-logo">
                                <img src={artWaveIcon} alt="Art Waves Unleashed" />
                            </div>
                            <h2>Art Waves Unleashed</h2>
                        </div>

                        <div className="payment-summary">
                            <h3>Price Summary</h3>
                            <div className="payment-amount">{formatCurrency(amount)}</div>
                        </div>

                        <div className="payment-user-info">
                            <div className="user-info-row">
                                <span className="user-icon">👤</span>
                                <span>Using as {customerInfo?.phone || '+91 96390 60737'}</span>
                                <FiChevronRight />
                            </div>
                        </div>

                        <div className="payment-illustration">
                            <div className="secured-by">
                                <span>Secured by</span>
                                <img src={razorpayLogo} alt="Razorpay" className="razorpay-logo" />
                            </div>
                        </div>
                    </div>

                    {/* Right Section */}
                    <div className="payment-modal-right">
                        <div className="payment-header">
                            <h2>Payment Options</h2>
                            <button className="close-button" onClick={onClose}>
                                <FaTimes />
                            </button>
                        </div>

                        <div className="payment-tabs">
                            <button
                                className={`tab-button ${activeTab === 'recommended' ? 'active' : ''}`}
                                onClick={() => setActiveTab('recommended')}
                            >
                                Recommended
                            </button>
                            <button
                                className={`tab-button ${activeTab === 'upi-qr' ? 'active' : ''}`}
                                onClick={() => setActiveTab('upi-qr')}
                            >
                                UPI QR
                            </button>
                        </div>

                        <div className="payment-methods">
                            {activeTab === 'recommended' && (
                                <>
                                    <div className="payment-section">
                                        <h3>UPI</h3>
                                        <div className="payment-options">
                                            <div
                                                className={`payment-option-icons ${activePaymentMethod === 'upi' ? 'active' : ''}`}
                                                onClick={() => setActivePaymentMethod('upi')}
                                            >
                                                <img src={googlePayIcon} alt="Google Pay" />
                                                <img src={phonepeIcon} alt="PhonePe" />
                                                <img src={paytmIcon} alt="Paytm" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="payment-section">
                                        <h3>Cards</h3>
                                        <div className="payment-options">
                                            <div
                                                className={`payment-option-icons ${activePaymentMethod === 'card' ? 'active' : ''}`}
                                                onClick={() => setActivePaymentMethod('card')}
                                            >
                                                <img src={visaIcon} alt="Visa" />
                                                <img src={mastercardIcon} alt="Mastercard" />
                                                <img src={rupayIcon} alt="RuPay" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="payment-section">
                                        <h3>Netbanking</h3>
                                        <div className="payment-options">
                                            <div
                                                className={`payment-option-icons ${activePaymentMethod === 'netbanking' ? 'active' : ''}`}
                                                onClick={() => setActivePaymentMethod('netbanking')}
                                            >
                                                <img src={sbiIcon} alt="SBI" />
                                                <img src={iciciIcon} alt="ICICI" />
                                                <img src={axisIcon} alt="Axis" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Payment Form with Formik */}
                                    {activePaymentMethod && (
                                        <Formik
                                            initialValues={getInitialValues()}
                                            validationSchema={getValidationSchema()}
                                            onSubmit={handlePaymentSubmit}
                                            enableReinitialize
                                        >
                                            {({ values, errors, touched, handleChange, handleBlur, setFieldValue, isSubmitting }) => (
                                                <Form className="payment-form">
                                                    {activePaymentMethod === 'card' && (
                                                        <div className="card-form">
                                                            <div className="form-group">
                                                                <label htmlFor="cardNumber">Card Number</label>
                                                                <div className="card-input-wrapper">
                                                                    <Field
                                                                        type="text"
                                                                        id="cardNumber"
                                                                        name="cardNumber"
                                                                        placeholder="1234 5678 9012 3456"
                                                                        maxLength="19"
                                                                        onChange={(e) => {
                                                                            const formatted = formatCardNumber(e.target.value);
                                                                            setFieldValue('cardNumber', formatted);
                                                                        }}
                                                                    />
                                                                    {values.cardNumber && (
                                                                        <div className={`card-type-indicator ${detectCardType(values.cardNumber)}`}>
                                                                            {detectCardType(values.cardNumber) === 'visa' && <img src={visaIcon} alt="Visa" />}
                                                                            {detectCardType(values.cardNumber) === 'mastercard' && <img src={mastercardIcon} alt="Mastercard" />}
                                                                            {detectCardType(values.cardNumber) === 'rupay' && <img src={rupayIcon} alt="RuPay" />}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <ErrorMessage name="cardNumber" component="div" className="error-message" />
                                                            </div>

                                                            <div className="form-group">
                                                                <label htmlFor="cardName">Name on Card</label>
                                                                <Field
                                                                    type="text"
                                                                    id="cardName"
                                                                    name="cardName"
                                                                    placeholder="John Doe"
                                                                />
                                                                <ErrorMessage name="cardName" component="div" className="error-message" />
                                                            </div>

                                                            <div className="form-row">
                                                                <div className="form-group half">
                                                                    <label htmlFor="expiryDate">Expiry Date</label>
                                                                    <Field
                                                                        type="text"
                                                                        id="expiryDate"
                                                                        name="expiryDate"
                                                                        placeholder="MM/YY"
                                                                        maxLength="5"
                                                                        onChange={(e) => {
                                                                            const formatted = formatExpiryDate(e.target.value);
                                                                            setFieldValue('expiryDate', formatted);
                                                                        }}
                                                                    />
                                                                    <ErrorMessage name="expiryDate" component="div" className="error-message" />
                                                                </div>

                                                                <div className="form-group half">
                                                                    <label htmlFor="cvv">CVV</label>
                                                                    <Field
                                                                        type="password"
                                                                        id="cvv"
                                                                        name="cvv"
                                                                        placeholder="***"
                                                                        maxLength="4"
                                                                    />
                                                                    <ErrorMessage name="cvv" component="div" className="error-message" />
                                                                </div>
                                                            </div>

                                                            <div className="save-card-option">
                                                                <label className="checkbox-label">
                                                                    <Field
                                                                        type="checkbox"
                                                                        name="saveCard"
                                                                    />
                                                                    <span>Save this card for future payments</span>
                                                                </label>
                                                            </div>

                                                            <div className="security-indicators">
                                                                <div className="security-indicator">
                                                                    <span className="lock-icon">🔒</span>
                                                                    <span>Your card details are secure and encrypted</span>
                                                                </div>
                                                                <div className="security-badges">
                                                                    <span className="security-badge">PCI DSS Compliant</span>
                                                                    <span className="security-badge">256-bit SSL</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {activePaymentMethod === 'upi' && (
                                                        <div className="upi-form">
                                                            <div className="form-group">
                                                                <label htmlFor="upiId">UPI ID</label>
                                                                <Field
                                                                    type="text"
                                                                    id="upiId"
                                                                    name="upiId"
                                                                    placeholder="username@upi"
                                                                />
                                                                <ErrorMessage name="upiId" component="div" className="error-message" />
                                                            </div>

                                                            <div className="upi-info">
                                                                <p>You will receive a payment request on your UPI app</p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {activePaymentMethod === 'netbanking' && (
                                                        <div className="netbanking-form">
                                                            <div className="bank-list">
                                                                {[
                                                                    { id: 'kotak', name: 'Kotak Mahindra Bank', icon: iciciIcon },
                                                                    { id: 'hdfc', name: 'HDFC Bank', icon: hdfcIcon },
                                                                    { id: 'sbi', name: 'State Bank of India', icon: sbiIcon },
                                                                    { id: 'icici', name: 'ICICI Bank', icon: iciciIcon }
                                                                ].map(bank => (
                                                                    <div
                                                                        key={bank.id}
                                                                        className={`bank-option ${values.selectedBank === bank.id ? 'selected' : ''}`}
                                                                        onClick={() => {
                                                                            setSelectedBank(bank.id);
                                                                            setFieldValue('selectedBank', bank.id);
                                                                        }}
                                                                    >
                                                                        <img src={bank.icon} alt={bank.name} />
                                                                        <span>{bank.name}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            <ErrorMessage name="selectedBank" component="div" className="error-message" />

                                                            <div className="netbanking-info">
                                                                <p>You will be redirected to your bank's website to complete the payment</p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="payment-action">
                                                        <button
                                                            type="submit"
                                                            className="pay-button"
                                                            disabled={isSubmitting || loading}
                                                        >
                                                            {loading || isSubmitting ? 'Processing...' : `Pay ${formatCurrency(amount)}`}
                                                        </button>
                                                    </div>
                                                </Form>
                                            )}
                                        </Formik>
                                    )}
                                </>
                            )}

                            {activeTab === 'upi-qr' && (
                                <div className="upi-qr-section">
                                    <div className="qr-code-container">
                                        <div className="qr-code-placeholder">
                                            {loading ? (
                                                <div className="loading-spinner">Loading...</div>
                                            ) : (
                                                <QRCode value='this is a qr code' />
                                            )}
                                        </div>
                                        <p>Scan the QR code using any UPI App</p>

                                        <div className="upi-apps">
                                            <img src={googlePayIcon} alt="Google Pay" />
                                            <img src={phonepeIcon} alt="PhonePe" />
                                            <img src={paytmIcon} alt="Paytm" />
                                            <img src={rupayIcon} alt="BHIM" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
