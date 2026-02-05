"""
Generate self-signed SSL certificate for Flask HTTPS
This creates cert.pem and key.pem files
"""
import ssl
import socket
import ipaddress
from datetime import datetime, timedelta
from cryptography import x509
from cryptography.x509.oid import NameOID
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa
import os

def generate_self_signed_cert():
    """Generate a self-signed SSL certificate"""
    # Generate private key
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048,
    )
    
    # Get hostname/IP for certificate
    hostname = socket.gethostname()
    local_ip = socket.gethostbyname(hostname)
    
    # Create certificate
    subject = issuer = x509.Name([
        x509.NameAttribute(NameOID.COUNTRY_NAME, "US"),
        x509.NameAttribute(NameOID.STATE_OR_PROVINCE_NAME, "Development"),
        x509.NameAttribute(NameOID.LOCALITY_NAME, "Local"),
        x509.NameAttribute(NameOID.ORGANIZATION_NAME, "Khata App"),
        x509.NameAttribute(NameOID.COMMON_NAME, hostname),
    ])
    
    cert = x509.CertificateBuilder().subject_name(
        subject
    ).issuer_name(
        issuer
    ).public_key(
        private_key.public_key()
    ).serial_number(
        x509.random_serial_number()
    ).not_valid_before(
        datetime.utcnow()
    ).not_valid_after(
        datetime.utcnow() + timedelta(days=365)
    ).add_extension(
        x509.SubjectAlternativeName([
            x509.DNSName("localhost"),
            x509.DNSName(hostname),
            x509.IPAddress(ipaddress.IPv4Address("127.0.0.1")),
            x509.IPAddress(ipaddress.IPv4Address("0.0.0.0")),
        ]),
        critical=False,
    ).sign(private_key, hashes.SHA256())
    
    # Write certificate file
    with open("cert.pem", "wb") as f:
        f.write(cert.public_bytes(serialization.Encoding.PEM))
    
    # Write private key file
    with open("key.pem", "wb") as f:
        f.write(private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption()
        ))
    
    print("SSL certificate generated successfully!")
    print(f"Certificate: cert.pem")
    print(f"Private key: key.pem")
    print(f"\nNote: This is a self-signed certificate.")
    print(f"Your browser will show a security warning.")
    print(f"Click 'Advanced' -> 'Proceed to localhost' (or your IP)")
    print(f"\nAccess your app at: https://localhost:5000")
    print(f"or https://{local_ip}:5000 (from your phone)")

if __name__ == "__main__":
    try:
        generate_self_signed_cert()
    except ImportError as e:
        print(f"Error: Missing required library: {e}")
        print("\nInstalling cryptography...")
        os.system("pip install cryptography")
        try:
            generate_self_signed_cert()
        except Exception as err:
            print(f"Error: {err}")
            print("\nAlternative: Install manually:")
            print("   pip install cryptography")
    except Exception as e:
        print(f"Error generating certificate: {e}")
        import traceback
        traceback.print_exc()

