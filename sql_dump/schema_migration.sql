--
-- PostgreSQL database dump
--

-- Dumped from database version 13.2
-- Dumped by pg_dump version 13.2

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

CREATE DATABASE aaok WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE = 'C';


ALTER DATABASE aaok OWNER TO aaok;

\connect aaok

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
-- Name: DATABASE aaok; Type: COMMENT; Schema: -; Owner: rafayat
--

COMMENT ON DATABASE aaok IS 'default administrative connection database';


--
-- Name: set_updated_at_column(); Type: FUNCTION; Schema: public; Owner: aaok
--

CREATE FUNCTION public.set_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.set_updated_at_column() OWNER TO aaok;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: answers; Type: TABLE; Schema: public; Owner: aaok
--

CREATE TABLE public.answers (
    answer_id bigint NOT NULL,
    response_id integer NOT NULL,
    field_id integer NOT NULL,
    value json,
    created_at timestamp(0) with time zone DEFAULT now(),
    updated_at timestamp(0) with time zone DEFAULT now()
);


ALTER TABLE public.answers OWNER TO aaok;

--
-- Name: answers_answer_id_seq; Type: SEQUENCE; Schema: public; Owner: aaok
--

CREATE SEQUENCE public.answers_answer_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.answers_answer_id_seq OWNER TO aaok;

--
-- Name: answers_answer_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aaok
--

ALTER SEQUENCE public.answers_answer_id_seq OWNED BY public.answers.answer_id;


--
-- Name: fields; Type: TABLE; Schema: public; Owner: aaok
--

CREATE TABLE public.fields (
    field_id integer NOT NULL,
    form_id integer NOT NULL,
    field_key character varying(30),
    label text,
    field_type integer DEFAULT 0 NOT NULL,
    json_config jsonb,
    created_at timestamp(0) with time zone DEFAULT now(),
    updated_at timestamp(0) with time zone DEFAULT now(),
    sort_order integer DEFAULT 0 NOT NULL,
    management_only boolean DEFAULT false NOT NULL
);


ALTER TABLE public.fields OWNER TO aaok;

--
-- Name: fields_field_id_seq; Type: SEQUENCE; Schema: public; Owner: aaok
--

CREATE SEQUENCE public.fields_field_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.fields_field_id_seq OWNER TO aaok;

--
-- Name: fields_field_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aaok
--

ALTER SEQUENCE public.fields_field_id_seq OWNED BY public.fields.field_id;


--
-- Name: forms; Type: TABLE; Schema: public; Owner: aaok
--

CREATE TABLE public.forms (
    form_id integer NOT NULL,
    title text NOT NULL,
    description text,
    created_at timestamp(0) with time zone DEFAULT now() NOT NULL,
    updated_at timestamp(0) with time zone DEFAULT now() NOT NULL,
    management_only boolean DEFAULT false NOT NULL
);


ALTER TABLE public.forms OWNER TO aaok;

--
-- Name: forms_form_id_seq; Type: SEQUENCE; Schema: public; Owner: aaok
--

CREATE SEQUENCE public.forms_form_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.forms_form_id_seq OWNER TO aaok;

--
-- Name: forms_form_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aaok
--

ALTER SEQUENCE public.forms_form_id_seq OWNED BY public.forms.form_id;


--
-- Name: responses; Type: TABLE; Schema: public; Owner: aaok
--

CREATE TABLE public.responses (
    response_id integer NOT NULL,
    user_id integer,
    form_id integer NOT NULL,
    created_at timestamp(0) with time zone DEFAULT now(),
    updated_at timestamp(0) with time zone DEFAULT now(),
    assigned_to integer,
    status integer DEFAULT 0 NOT NULL,
    notes text DEFAULT ''::text
);


ALTER TABLE public.responses OWNER TO aaok;

--
-- Name: response_response_id_seq; Type: SEQUENCE; Schema: public; Owner: aaok
--

CREATE SEQUENCE public.response_response_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.response_response_id_seq OWNER TO aaok;

--
-- Name: response_response_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aaok
--

ALTER SEQUENCE public.response_response_id_seq OWNED BY public.responses.response_id;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: aaok
--

CREATE TABLE public.roles (
    role_id integer NOT NULL,
    role_code character varying(10) NOT NULL,
    role_name character varying(50)
);


ALTER TABLE public.roles OWNER TO aaok;

--
-- Name: user_roles_role_id_seq; Type: SEQUENCE; Schema: public; Owner: aaok
--

CREATE SEQUENCE public.user_roles_role_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_roles_role_id_seq OWNER TO aaok;

--
-- Name: user_roles_role_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aaok
--

ALTER SEQUENCE public.user_roles_role_id_seq OWNED BY public.roles.role_id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: aaok
--

CREATE TABLE public.users (
    user_id integer NOT NULL,
    first_name character varying(100),
    last_name character varying(100),
    email character varying(150) NOT NULL,
    password character varying(200),
    is_enabled integer,
    is_registered integer,
    created_at timestamp(0) with time zone DEFAULT now(),
    updated_at timestamp(0) with time zone DEFAULT now(),
    is_management integer DEFAULT 0 NOT NULL,
    reset_token text DEFAULT ''::text
);


ALTER TABLE public.users OWNER TO aaok;

--
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: aaok
--

CREATE SEQUENCE public.users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_user_id_seq OWNER TO aaok;

--
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aaok
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- Name: answers answer_id; Type: DEFAULT; Schema: public; Owner: aaok
--

ALTER TABLE ONLY public.answers ALTER COLUMN answer_id SET DEFAULT nextval('public.answers_answer_id_seq'::regclass);


--
-- Name: fields field_id; Type: DEFAULT; Schema: public; Owner: aaok
--

ALTER TABLE ONLY public.fields ALTER COLUMN field_id SET DEFAULT nextval('public.fields_field_id_seq'::regclass);


--
-- Name: forms form_id; Type: DEFAULT; Schema: public; Owner: aaok
--

ALTER TABLE ONLY public.forms ALTER COLUMN form_id SET DEFAULT nextval('public.forms_form_id_seq'::regclass);


--
-- Name: responses response_id; Type: DEFAULT; Schema: public; Owner: aaok
--

ALTER TABLE ONLY public.responses ALTER COLUMN response_id SET DEFAULT nextval('public.response_response_id_seq'::regclass);


--
-- Name: roles role_id; Type: DEFAULT; Schema: public; Owner: aaok
--

ALTER TABLE ONLY public.roles ALTER COLUMN role_id SET DEFAULT nextval('public.user_roles_role_id_seq'::regclass);


--
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: aaok
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- Name: answers answers_pk; Type: CONSTRAINT; Schema: public; Owner: aaok
--

ALTER TABLE ONLY public.answers
    ADD CONSTRAINT answers_pk PRIMARY KEY (answer_id);


--
-- Name: fields fields_pk; Type: CONSTRAINT; Schema: public; Owner: aaok
--

ALTER TABLE ONLY public.fields
    ADD CONSTRAINT fields_pk PRIMARY KEY (field_id);


--
-- Name: forms forms_pk; Type: CONSTRAINT; Schema: public; Owner: aaok
--

ALTER TABLE ONLY public.forms
    ADD CONSTRAINT forms_pk PRIMARY KEY (form_id);


--
-- Name: responses response_pk; Type: CONSTRAINT; Schema: public; Owner: aaok
--

ALTER TABLE ONLY public.responses
    ADD CONSTRAINT response_pk PRIMARY KEY (response_id);


--
-- Name: roles user_roles_pk; Type: CONSTRAINT; Schema: public; Owner: aaok
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT user_roles_pk PRIMARY KEY (role_id);


--
-- Name: users users_pk; Type: CONSTRAINT; Schema: public; Owner: aaok
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pk PRIMARY KEY (user_id);


--
-- Name: users users_un; Type: CONSTRAINT; Schema: public; Owner: aaok
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_un UNIQUE (email);


--
-- Name: fields set_updated_at; Type: TRIGGER; Schema: public; Owner: aaok
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.fields FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_column();


--
-- Name: forms set_updated_at; Type: TRIGGER; Schema: public; Owner: aaok
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.forms FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_column();


--
-- Name: users set_updated_at; Type: TRIGGER; Schema: public; Owner: aaok
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_column();


--
-- Name: fields fields_fk; Type: FK CONSTRAINT; Schema: public; Owner: aaok
--

ALTER TABLE ONLY public.fields
    ADD CONSTRAINT fields_fk FOREIGN KEY (form_id) REFERENCES public.forms(form_id);


--
-- PostgreSQL database dump complete
--
