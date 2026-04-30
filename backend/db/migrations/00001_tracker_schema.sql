-- +goose Up

CREATE TABLE IF NOT EXISTS media (
    id               INT          PRIMARY KEY AUTO_INCREMENT,
    title            VARCHAR(200) NOT NULL,
    type             ENUM('book', 'movie') NOT NULL,
    series           ENUM('lotr', 'hobbit') NOT NULL,
    year             INT          NOT NULL,
    order_in_series  INT          NOT NULL
);

INSERT INTO media (title, type, series, year, order_in_series) VALUES
('The Hobbit',                    'book',  'hobbit', 1937, 1),
('An Unexpected Journey',         'movie', 'hobbit', 2012, 2),
('The Desolation of Smaug',       'movie', 'hobbit', 2013, 3),
('The Battle of the Five Armies', 'movie', 'hobbit', 2014, 4),
('The Fellowship of the Ring',    'book',  'lotr',   1954, 1),
('The Two Towers',                'book',  'lotr',   1954, 2),
('The Return of the King',        'book',  'lotr',   1955, 3),
('The Fellowship of the Ring',    'movie', 'lotr',   2001, 4),
('The Two Towers',                'movie', 'lotr',   2002, 5),
('The Return of the King',        'movie', 'lotr',   2003, 6);

CREATE TABLE IF NOT EXISTS tracker_users (
    id            INT          PRIMARY KEY AUTO_INCREMENT,
    username      VARCHAR(50)  NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_progress (
    id           INT  PRIMARY KEY AUTO_INCREMENT,
    user_id      INT  NOT NULL,
    media_id     INT  NOT NULL,
    status       ENUM('not_started', 'in_progress', 'completed') DEFAULT 'not_started',
    rating       INT  NULL,
    review       TEXT NULL,
    completed_at TIMESTAMP NULL,
    UNIQUE KEY uq_user_media (user_id, media_id),
    FOREIGN KEY (user_id)  REFERENCES tracker_users(id) ON DELETE CASCADE,
    FOREIGN KEY (media_id) REFERENCES media(id)
);

-- +goose Down
DROP TABLE IF EXISTS user_progress;
DROP TABLE IF EXISTS tracker_users;
DROP TABLE IF EXISTS media;
