const crypto = require('crypto');
const bcrypt = require('bcryptjs');

class EncryptionService {
  constructor() {
    this.algorithm = 'aes-256-gcm';
    this.keyLength = 32;
    this.ivLength = 16;
    this.tagLength = 16;
    this.saltLength = 64;
    
    // Ensure encryption key exists
    if (!process.env.ENCRYPTION_KEY) {
      throw new Error('ENCRYPTION_KEY environment variable is required');
    }
    
    this.masterKey = crypto.scryptSync(process.env.ENCRYPTION_KEY, 'salt', this.keyLength);
  }

  // Encrypt sensitive data
  encryptSensitiveData(data) {
    try {
      const iv = crypto.randomBytes(this.ivLength);
      const cipher = crypto.createCipher(this.algorithm, this.masterKey, { iv });
      
      let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const tag = cipher.getAuthTag();
      
      return {
        encrypted,
        iv: iv.toString('hex'),
        tag: tag.toString('hex')
      };
    } catch (error) {
      throw new Error('Encryption failed: ' + error.message);
    }
  }

  // Decrypt sensitive data
  decryptSensitiveData(encryptedData) {
    try {
      const { encrypted, iv, tag } = encryptedData;
      
      const decipher = crypto.createDecipher(
        this.algorithm, 
        this.masterKey, 
        { iv: Buffer.from(iv, 'hex') }
      );
      
      decipher.setAuthTag(Buffer.from(tag, 'hex'));
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return JSON.parse(decrypted);
    } catch (error) {
      throw new Error('Decryption failed: ' + error.message);
    }
  }

  // Hash sensitive fields for searching
  hashForSearch(data) {
    return crypto.createHash('sha256').update(data.toLowerCase()).digest('hex');
  }

  // Generate secure tokens
  generateSecureToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  // Encrypt PII fields in client data
  encryptClientPII(clientData) {
    const sensitiveFields = ['ssn', 'bankAccount', 'creditCardNumber', 'phoneNumber'];
    const encrypted = { ...clientData };
    
    sensitiveFields.forEach(field => {
      if (encrypted[field]) {
        encrypted[field] = this.encryptSensitiveData(encrypted[field]);
        // Create searchable hash
        encrypted[`${field}Hash`] = this.hashForSearch(clientData[field]);
      }
    });
    
    return encrypted;
  }

  // Decrypt PII fields in client data
  decryptClientPII(encryptedClientData) {
    const sensitiveFields = ['ssn', 'bankAccount', 'creditCardNumber', 'phoneNumber'];
    const decrypted = { ...encryptedClientData };
    
    sensitiveFields.forEach(field => {
      if (decrypted[field] && typeof decrypted[field] === 'object') {
        try {
          decrypted[field] = this.decryptSensitiveData(decrypted[field]);
        } catch (error) {
          console.error(`Failed to decrypt ${field}:`, error);
          decrypted[field] = '[ENCRYPTED]';
        }
      }
    });
    
    return decrypted;
  }

  // Audit trail encryption
  encryptAuditData(auditData) {
    return this.encryptSensitiveData({
      ...auditData,
      timestamp: new Date().toISOString(),
      checksum: this.generateChecksum(auditData)
    });
  }

  // Generate checksum for data integrity
  generateChecksum(data) {
    return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
  }

  // Verify data integrity
  verifyChecksum(data, expectedChecksum) {
    const actualChecksum = this.generateChecksum(data);
    return actualChecksum === expectedChecksum;
  }
}

// Middleware for automatic PII encryption
const encryptionMiddleware = (req, res, next) => {
  const encryptionService = new EncryptionService();
  
  // Add encryption methods to request object
  req.encrypt = encryptionService.encryptSensitiveData.bind(encryptionService);
  req.decrypt = encryptionService.decryptSensitiveData.bind(encryptionService);
  req.encryptPII = encryptionService.encryptClientPII.bind(encryptionService);
  req.decryptPII = encryptionService.decryptClientPII.bind(encryptionService);
  
  next();
};

// Data masking for logs and responses
const maskSensitiveData = (data) => {
  const sensitivePatterns = {
    ssn: /\d{3}-\d{2}-\d{4}/g,
    creditCard: /\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}/g,
    phone: /\(\d{3}\)\s?\d{3}-\d{4}/g,
    email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
  };
  
  let maskedData = JSON.stringify(data);
  
  Object.entries(sensitivePatterns).forEach(([type, pattern]) => {
    maskedData = maskedData.replace(pattern, (match) => {
      if (type === 'email') {
        const [local, domain] = match.split('@');
        return `${local.charAt(0)}***@${domain}`;
      } else if (type === 'creditCard') {
        return `****-****-****-${match.slice(-4)}`;
      } else if (type === 'ssn') {
        return `***-**-${match.slice(-4)}`;
      } else if (type === 'phone') {
        return `(***) ***-${match.slice(-4)}`;
      }
      return '***';
    });
  });
  
  return JSON.parse(maskedData);
};

module.exports = {
  EncryptionService,
  encryptionMiddleware,
  maskSensitiveData
};

