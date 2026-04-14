package com.swift.platform.config;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

/**
 * Central configuration bean.
 * All @Value fields live here — override any with OS env vars, no rebuild needed.
 *
 *   export MONGO_COLLECTION_SWIFT=my_swift_msgs
 *   export JWT_SECRET=my-secret-key
 *   java -jar swift-backend.jar
 */
@Getter
@Configuration
public class AppConfig {

    // ── MongoDB collections ────────────────────────────────────────────────
    @Value("${mongo.collection.swift:amp_messages}")
    private String swiftCollection;

    @Value("${mongo.collection.payloads:amp_payloads}")
    private String payloadsCollection;

    @Value("${mongo.collection.users:user_data}")
    private String usersCollection;

    @Value("${mongo.collection.audit:audit_logs}")
    private String auditCollection;

    // ── Search ────────────────────────────────────────────────────────────
    @Value("${search.default-page-size:20}")
    private int defaultPageSize;

    @Value("${search.max-page-size:500}")
    private int maxPageSize;

    @Value("${search.metadata-cache-ttl-ms:300000}")
    private long metadataCacheTtlMs;

    @Value("${search.field-discovery-sample-size:200}")
    private int fieldDiscoverySampleSize;

    @Value("${search.payload-fetch-batch-size:1000}")
    private int payloadFetchBatchSize;

    @Value("${search.export-fetch-batch-size:5000}")
    private int exportFetchBatchSize;

    @Value("${search.optimize-without-lookup:true}")
    private boolean optimizeWithoutLookup;

    @Value("${search.ensure-indexes:true}")
    private boolean ensureIndexes;

    @Value("${mongo.collection.rawcopies:amp_raw_copies}")
    private String rawCopiesCollection;

    @Value("${mongo.collection.mt-labels:mt_lable}")
    private String mtLabelsCollection;

    // ── Admin ─────────────────────────────────────────────────────────────
    @Value("${admin.protected-id:ADMIN001}")
    private String protectedAdminId;

    // ── JWT ───────────────────────────────────────────────────────────────
    @Value("${jwt.secret:SwiftPlatformSecretKey2024!@#$%^&*()ABCDEF_MUST_BE_32_CHARS_MIN}")
    private String jwtSecret;

    @Value("${jwt.expiration:86400000}")
    private long jwtExpiration;
}
