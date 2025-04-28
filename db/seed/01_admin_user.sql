INSERT INTO "users"
VALUES (
        gen_random_uuid(),
        'admin@test.com',
        '$2a$12$nyH7Coq0wHqjuwDpBdpW.eA1AgnoJqpHP1wTyR4i08pGejAYdVm96',
        -- password: admin
        NOW()
    );