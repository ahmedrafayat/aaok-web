--
-- PostgreSQL database dump
--

-- Dumped from database version 13.3
-- Dumped by pg_dump version 13.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: postgres; Type: DATABASE; Schema: -; Owner: rafayat
--

CREATE DATABASE postgres WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE = 'C';


ALTER DATABASE postgres OWNER TO rafayat;

\connect postgres

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: DATABASE postgres; Type: COMMENT; Schema: -; Owner: rafayat
--

COMMENT ON DATABASE postgres IS 'default administrative connection database';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: notification_tokens; Type: TABLE; Schema: public; Owner: aaok
--

CREATE TABLE public.notification_tokens (
    token_id integer NOT NULL,
    token_value character varying(50) NOT NULL,
    user_id integer NOT NULL
);


ALTER TABLE public.notification_tokens OWNER TO aaok;

--
-- Name: notification_tokens_token_id_seq; Type: SEQUENCE; Schema: public; Owner: aaok
--

CREATE SEQUENCE public.notification_tokens_token_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.notification_tokens_token_id_seq OWNER TO aaok;

--
-- Name: notification_tokens_token_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aaok
--

ALTER SEQUENCE public.notification_tokens_token_id_seq OWNED BY public.notification_tokens.token_id;


--
-- Name: notification_tokens token_id; Type: DEFAULT; Schema: public; Owner: aaok
--

ALTER TABLE ONLY public.notification_tokens ALTER COLUMN token_id SET DEFAULT nextval('public.notification_tokens_token_id_seq'::regclass);


--
-- Name: notification_tokens notification_tokens_pk; Type: CONSTRAINT; Schema: public; Owner: aaok
--

ALTER TABLE ONLY public.notification_tokens
    ADD CONSTRAINT notification_tokens_pk PRIMARY KEY (token_id);


--
-- Name: notification_tokens notification_tokens_un; Type: CONSTRAINT; Schema: public; Owner: aaok
--

ALTER TABLE ONLY public.notification_tokens
    ADD CONSTRAINT notification_tokens_un UNIQUE (token_value);


--
-- Name: notification_tokens notification_tokens_fk; Type: FK CONSTRAINT; Schema: public; Owner: aaok
--

ALTER TABLE ONLY public.notification_tokens
    ADD CONSTRAINT notification_tokens_fk FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- PostgreSQL database dump complete
--

