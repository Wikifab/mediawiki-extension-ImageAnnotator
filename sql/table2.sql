
CREATE TABLE /*_*/annotatedimages (

  ai_id int(11) UNSIGNED  NOT null primary key auto_increment

  
  ai_page_id int(11) UNSIGNED NOT NULL,
  ai_filename varchar(256) NOT NULL,
  ai_hash varchar(64) NOT NULL,

  ai_data_json text  DEFAULT '',

  ai_data_svg text TEXT DEFAULT '',

  ai_thumbfile varchar(256) NULL,

  -- Timestamp used to send notification e-mails and show "updated since last visit" markers on
  -- history and recent changes / watchlist. Set to NULL when the user visits the latest revision
  -- of the page, which means that they should be sent an e-mail on the next change.
  pb_notificationtimestamp varbinary(14)

) /*$wgDBTableOptions*/;

CREATE INDEX /*i*/annotatedimages_page_id ON /*_*/annotatedimages (ai_page_id);
CREATE INDEX /*i*/annotatedimages_filename ON /*_*/annotatedimages (ai_filename);
CREATE INDEX /*i*/annotatedimages_filename_data_json ON /*_*/annotatedimages (ai_filename, ai_data_json);
