--
-- PostgreSQL database dump
--

\restrict 9f68IUmgLpEsj0UsoXCwVaLkhYIXlsgTuNOWYwJejCNR3D5F2ce10oFcUPHtvdy

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: chat_messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chat_messages (
    id text NOT NULL,
    "senderId" text NOT NULL,
    "receiverId" text,
    content text NOT NULL,
    read boolean DEFAULT false NOT NULL,
    "readAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "isEdited" boolean DEFAULT false NOT NULL,
    "editedAt" timestamp(3) without time zone
);


ALTER TABLE public.chat_messages OWNER TO postgres;

--
-- Name: employees; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employees (
    id text NOT NULL,
    "fullName" text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    gender text NOT NULL,
    dob date NOT NULL,
    department text NOT NULL,
    "position" text NOT NULL,
    salary integer NOT NULL,
    "joiningDate" date NOT NULL,
    status text NOT NULL,
    address text NOT NULL,
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "profilePhoto" text,
    role text DEFAULT 'employee'::text NOT NULL
);


ALTER TABLE public.employees OWNER TO postgres;

--
-- Name: leaves; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.leaves (
    id text NOT NULL,
    "leaveType" text NOT NULL,
    "startDate" date NOT NULL,
    "endDate" date NOT NULL,
    reason text NOT NULL,
    status text DEFAULT 'PENDING'::text NOT NULL,
    "rejectionReason" text,
    "actionDate" timestamp(3) without time zone,
    "userId" text NOT NULL,
    "employeeId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.leaves OWNER TO postgres;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    type text DEFAULT 'info'::text NOT NULL,
    read boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "userId" text NOT NULL
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: user_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_settings (
    id text NOT NULL,
    "notifyEmployee" boolean DEFAULT true NOT NULL,
    "notifySystem" boolean DEFAULT true NOT NULL,
    "notifyLogin" boolean DEFAULT true NOT NULL,
    "userId" text NOT NULL
);


ALTER TABLE public.user_settings OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id text NOT NULL,
    "fullName" text NOT NULL,
    email text NOT NULL,
    "passwordHash" text,
    "avatarSeed" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "profilePhoto" text,
    "isOnboarded" boolean DEFAULT false NOT NULL,
    role text DEFAULT 'employee'::text NOT NULL,
    "authProvider" text DEFAULT 'local'::text NOT NULL,
    "emailVerified" boolean DEFAULT false NOT NULL,
    "googleId" text
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
f709fd03-cd96-4af7-9dd5-bf35cd65c9c7	5cb606388757990aa5d441989a2042c6b8e73bdb9e8d22edc1cfc478e093ac0b	2026-08-18 12:38:12.046899+05:30	20260818070811_init	\N	\N	2026-08-18 12:38:11.944256+05:30	1
a5131b9d-1d95-409a-8a1c-07d191d1ce21	4f1193cb3363583d195e65a36708512615f3413dcea1fe11ec3e80759ea8e219	2026-08-25 14:25:46.923311+05:30	20260825085546_add_profile_photo_fields	\N	\N	2026-08-25 14:25:46.890523+05:30	1
da626fe9-bacb-4d5f-b614-372b01886b35	e0d4fbb0d148d5631b8a3124000d2588e03b75f6b0d196320be07284577823be	2026-09-01 12:27:51.362089+05:30	20260901065751_add_role_to_user	\N	\N	2026-09-01 12:27:51.302942+05:30	1
a600b330-389a-4eb7-a3c3-14510921fc35	7df6fae3b2122de310ecea0525b7bf40a08ee84f4adecb96cfdba6cb39169034	2026-09-01 16:02:37.067754+05:30	20260901103237_add_role_to_employee	\N	\N	2026-09-01 16:02:37.022876+05:30	1
15faee04-2de7-4610-a4be-45682e8c83d6	ac3db507e99f4fe2cb1ec62063f37a0a52331d242758e8d0deb42481cd2cfdd3	2026-09-16 12:07:47.343082+05:30	20260916120600_add_google_oauth_fields		\N	2026-09-16 12:07:47.343082+05:30	0
d38f0f3e-2dc3-44e0-a59f-904914109ea6	c78499b61691bb86671caddf226cea83f132fbf30924460601c286cad58c4029	2026-09-22 14:20:07.420558+05:30	20260922141700_add_chat_models	\N	\N	2026-09-22 14:20:07.138524+05:30	1
4248fec8-a943-44c0-bf16-b2ce24eb440f	2e108e20df5bb3a9ed732b251f027b432fd567d51838944187259787124962c7	2026-09-24 12:34:59.102741+05:30	20260924000000_add_chat_message_is_edited	\N	\N	2026-09-24 12:34:58.935613+05:30	1
5cd0fea2-48e7-40df-bac6-85fd2b39d48b	9a0534dfd9c623d3b395f63ed9ca364d8f103a401527b4d692ebff3c337a1348	2026-09-28 12:04:55.702442+05:30	20260928120000_single_table_chat_refactor	\N	\N	2026-09-28 12:04:55.514323+05:30	1
\.


--
-- Data for Name: chat_messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.chat_messages (id, "senderId", "receiverId", content, read, "readAt", "createdAt", "updatedAt", "isEdited", "editedAt") FROM stdin;
58547156-03ad-4c2e-ab99-f8dd92cbf5ca	994e829d-7290-444e-95f9-37329e2f9e57	cmsyh065r0002wkjh77azh9m7	Hey	t	2026-09-23 05:59:00.393	2026-09-23 05:58:49.171	2026-09-23 05:59:00.402	f	\N
0b1fd391-6b34-4f6e-9460-9dc5249ce4ea	cmsyh065r0002wkjh77azh9m7	994e829d-7290-444e-95f9-37329e2f9e57	Hello , How can i help you?	t	2026-09-23 05:59:21.753	2026-09-23 05:59:21.733	2026-09-23 05:59:21.754	f	\N
32fa5cf2-ac42-45c3-aede-a27e12e9b49e	cmsyh065r0002wkjh77azh9m7	cmsylxc7g0002mkjh6yjq9fju	Hey , Manager	t	2026-09-23 07:00:50.559	2026-09-23 07:00:40.009	2026-09-23 07:00:50.567	f	\N
56f87931-cc7d-41c7-adce-cec29fb62fe1	cmsylxc7g0002mkjh6yjq9fju	cmsyh065r0002wkjh77azh9m7	😃	t	2026-09-23 08:42:08.807	2026-09-23 08:41:45.798	2026-09-23 08:42:08.808	f	\N
0f42b579-6c27-4f93-aa57-fa240ca7f6f3	994e829d-7290-444e-95f9-37329e2f9e57	15c2b6b0-b397-42f7-a5c8-610ecc9a456e	Okay	t	2026-09-23 10:21:18.546	2026-09-23 10:21:14.736	2026-09-23 10:21:18.547	f	\N
ef53cb98-9425-4e63-b2b4-f1c7e6c750d0	15c2b6b0-b397-42f7-a5c8-610ecc9a456e	994e829d-7290-444e-95f9-37329e2f9e57	we ha've meeting at 4:00 pm be Prepared.	t	2026-09-23 10:20:35.372	2026-09-23 10:20:07.74	2026-09-24 07:06:29.45	t	2026-09-24 07:06:29.4
cf740caa-9496-4ed8-8d54-717951d9bacf	15c2b6b0-b397-42f7-a5c8-610ecc9a456e	f42218d2-a1ed-4ac7-bdcd-8c4233a5c699	hi	f	\N	2026-09-24 10:58:32.505	2026-09-24 10:58:32.505	f	\N
253a1f22-5dea-4295-8a26-45e8f7c59b3f	994e829d-7290-444e-95f9-37329e2f9e57	15c2b6b0-b397-42f7-a5c8-610ecc9a456e	hi	t	2026-09-24 10:58:48.968	2026-09-24 10:58:48.943	2026-09-24 10:58:48.97	f	\N
11e56ad6-0602-4180-8e5c-4f760a173814	15c2b6b0-b397-42f7-a5c8-610ecc9a456e	994e829d-7290-444e-95f9-37329e2f9e57	can we meet regarding projec	t	2026-09-24 07:57:48.133	2026-09-24 07:57:48.085	2026-09-24 10:58:59.296	t	2026-09-24 10:58:59.272
b8d78e54-9c75-40f1-bb3c-6b60063111a1	cmsyh065r0002wkjh77azh9m7	9e549c92-f874-4703-a012-cc6eaa7e8ce4	hello	t	2026-09-28 07:02:18.138	2026-09-28 07:00:29.168	2026-09-28 07:02:18.14	f	\N
bb657699-fda7-416a-ba91-84510b3cc2de	38c434a6-d184-4f7a-be0f-3a40c5928cff	cmsyh065r0002wkjh77azh9m7	how cani help you	t	2026-09-28 08:56:14.524	2026-09-28 08:56:14.509	2026-09-28 08:56:14.53	f	\N
cda4380a-7207-47fa-b36d-f36a89a1857f	cmsyh065r0002wkjh77azh9m7	38c434a6-d184-4f7a-be0f-3a40c5928cff	hello	t	2026-09-28 08:56:04.688	2026-09-28 08:56:02.039	2026-09-28 08:57:23.002	t	2026-09-28 08:57:22.979
aad6097b-8687-435f-bd7e-7d57623bf0ef	38c434a6-d184-4f7a-be0f-3a40c5928cff	cmsyh065r0002wkjh77azh9m7	?	t	2026-09-28 08:58:13.041	2026-09-28 08:57:52.777	2026-09-28 08:58:13.043	f	\N
ac28a56d-1bcf-4885-b6bf-548e3d9d7035	cmsyh065r0002wkjh77azh9m7	994e829d-7290-444e-95f9-37329e2f9e57	Hello how's the project going	t	2026-09-29 07:13:29.254	2026-09-29 07:13:24.078	2026-09-29 07:13:29.255	f	\N
59547a9b-9154-463c-b435-ee303b694b00	994e829d-7290-444e-95f9-37329e2f9e57	cmsyh065r0002wkjh77azh9m7	Hi	t	2026-09-29 06:10:10.994	2026-09-29 06:10:05.97	2026-09-29 07:13:43.024	t	2026-09-29 07:13:43.023
d28d8264-e021-4a04-b46f-956aa2497df1	cmsyh065r0002wkjh77azh9m7	994e829d-7290-444e-95f9-37329e2f9e57	can we meet today regarding project?	t	2026-09-30 09:48:05.695	2026-09-30 09:47:20.807	2026-09-30 09:48:05.714	f	\N
\.


--
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employees (id, "fullName", email, phone, gender, dob, department, "position", salary, "joiningDate", status, address, "userId", "createdAt", "updatedAt", "profilePhoto", role) FROM stdin;
2d4af7d9-0079-4552-96d3-7b4160940cbe	Dhruv Kavathiya	dhruv@york.ie	+919512589456	Male	2007-09-20	Sales	Buisness Development	65000	2025-06-02	Inactive	Gandhinagar	f42218d2-a1ed-4ac7-bdcd-8c4233a5c699	2026-09-22 11:34:02.519	2026-09-22 11:34:02.519	\N	employee
d56d07df-2e29-41ad-b984-c2b1a61a94e1	Dev Chauhan	dev@york.ie	+918513647955	Male	2002-12-06	Engineering	Python Developer	65000	2020-11-18	Inactive	naroda	5d58ba82-a176-4d8f-b467-11d41693497b	2026-08-24 09:13:03.203	2026-09-30 06:21:23.56	\N	employee
09a54007-7ee3-49dd-be36-87f997e14e0f	Mann Gandhi	mann@york.ie	+919978981478	Male	2006-01-19	Design	UI UX	85000	2026-09-03	Active	bopal	994e829d-7290-444e-95f9-37329e2f9e57	2026-09-03 08:52:54.699	2026-09-22 11:56:58.343	emp-1788745566373-562222652.jpeg	employee
EMP1787120788253	Liza Satasiya	liza@york.ie	7864296598	Female	2004-10-02	Engineering	AI Engeneer	85000	2025-06-15	Active	Surat	a004dbe4-aaa4-4543-baea-f238420abfc4	2026-08-19 06:26:28.273	2026-09-22 12:02:55.214	\N	employee
EMP1787052724562	Rushi Gandhi	rushi@york.ie	+919510875429	Male	2005-05-21	Engineering	Backend Developer	65000	2026-08-01	Active	C/2 Vrajvihar Banglows d.p road modasa near pavan city	249c8f2d-efdd-46e5-969d-5bc3cac445f5	2026-08-18 11:32:04.568	2026-09-23 07:05:29.011	\N	employee
EMP1787133588359	Drashti Thakkar	drashti@york.ie	8556547290	Female	2005-06-01	Engineering	n8n	100000	2026-05-05	Active	Nikol	d8695881-ed27-455a-8aa2-66c0b479f119	2026-08-19 09:59:48.383	2026-09-29 11:38:03.919	\N	employee
7f63b213-cf22-4030-a361-863b90bc6be0	Hardik Panchal	hardik@york.ie	+918952456983	Male	1992-10-02	Design	SR UI UX	72000	2022-03-12	Active	Gandhinagar	7e2cc038-c86e-43c3-b97a-3fa9d1b5648a	2026-08-26 12:20:22.543	2026-09-30 06:21:12.353	\N	employee
cdfeb012-9ccc-4953-9488-ab6ace81649f	Rohit Shah	rohit@york.ie	+917896541232	Male	2005-09-21	Engineering	n8n	90000	2026-09-11	Active	Maninagar	38c434a6-d184-4f7a-be0f-3a40c5928cff	2026-09-11 05:47:33.658	2026-09-11 07:10:43.989	\N	employee
EMP1787055678838	Krupa Sodagar	krupa@gmail.com	+919658452145	Female	2006-01-02	Human Resources	Sr HR	45000	2026-05-05	On Leave	Ahmedabad	cmsyh065r0002wkjh77azh9m7	2026-08-18 12:21:18.864	2026-08-26 06:35:24.343	\N	employee
EMP1787121418210	Heer Limbachiya	heer@york.ie	+916547529846	Male	2004-03-17	Design	UI UX	77000	2024-02-01	Inactive	Patan	cmsyh065r0002wkjh77azh9m7	2026-08-19 06:36:58.214	2026-08-26 06:35:36.06	\N	employee
8cb7d02e-9593-4692-8f19-5593dfd0c652	Dhanvin Pandya	dhanvin@york.ie	+919427537999	Male	2005-08-17	Marketing	Product Manager	85000	2026-06-05	Active	Vallabh Bunglows	cmsylxc7g0002mkjh6yjq9fju	2026-09-07 12:34:15.998	2026-09-13 17:55:08.799	\N	manager
a08b708c-2354-429c-a192-905d10caa939	Atman Mehta	atman@york.ie	+919874563215	Male	2004-02-29	Engineering	Product Manager	50000	2026-07-21	On Leave	Navrangpura	cmsyh065r0002wkjh77azh9m7	2026-08-27 07:13:31.847	2026-09-11 07:03:28.882	\N	manager
2ff00aa8-030d-4e07-ada7-a28800dd5b57	Jigna Gandhi	jigna@york.ie	+919979891478	Female	1975-04-01	Support	Incom Tax support	100000	2026-09-01	Active	Ghuma gam	9e549c92-f874-4703-a012-cc6eaa7e8ce4	2026-09-13 17:56:13.749	2026-09-15 06:16:27.145	\N	employee
f69474ed-6944-4397-b5c5-3441a48ccd72	Kathan Gandhi	kathangandhi1999@gmail.com	+917436033979	Male	1999-01-10	Marketing	Product Manager	90000	2022-05-21	Active	Ontario	a49b9cf7-510b-4f86-89e7-2e49bc57cd4c	2026-09-03 05:37:55.078	2026-09-18 09:58:13.139	emp-1788745778520-639361415.jpg	employee
EMP1787510297810	Pratham Parikh	pratham@york.ie	+917895612356	Male	2004-02-02	Engineering	MERN Stack	150000	2021-02-02	Active	Lunawada	b7ddda6d-82c4-414b-9e19-dca658ebfe4f	2026-08-23 18:38:17.839	2026-09-22 09:44:05.257	\N	employee
392bae9f-ac08-4c43-a7fd-97224c67c374	Ketan Prajapat	ketan@york.ie	+917856214597	Male	2002-03-03	Engineering	n8n	85000	2021-12-11	Active	Rajkot	b1f2b526-aed5-42af-973e-504d59089af3	2026-09-01 12:33:58.051	2026-09-22 09:44:05.282	\N	employee
\.


--
-- Data for Name: leaves; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.leaves (id, "leaveType", "startDate", "endDate", reason, status, "rejectionReason", "actionDate", "userId", "employeeId", "createdAt", "updatedAt") FROM stdin;
4c1fb923-856a-4fe0-86d7-eafb654135d4	Work From Home	2026-09-09	2026-09-11	grandfather funeral	APPROVED	\N	2026-09-08 06:40:10.913	cmsylxc7g0002mkjh6yjq9fju	8cb7d02e-9593-4692-8f19-5593dfd0c652	2026-09-08 06:39:10.883	2026-09-08 06:40:10.919
31aeeb69-fae5-4e43-93c6-f9c30b2cec6f	Sick Leave	2026-09-09	2026-09-10	fever	REJECTED	\N	2026-09-08 06:41:29.141	cmsylxc7g0002mkjh6yjq9fju	8cb7d02e-9593-4692-8f19-5593dfd0c652	2026-09-08 06:41:00.59	2026-09-08 06:41:29.141
0bb47afb-d3aa-44c4-bd47-7b5c57236dc5	Casual Leave	2026-09-09	2026-09-11	i want to go to trip with my family	APPROVED	\N	2026-09-08 06:47:37.697	994e829d-7290-444e-95f9-37329e2f9e57	09a54007-7ee3-49dd-be36-87f997e14e0f	2026-09-08 06:46:54.371	2026-09-08 06:47:37.699
a6a01141-3de8-4cb4-bcc0-3e834019fad1	Work From Home	2026-09-15	2026-09-16	medical appointment	REJECTED	On this date, it will be an important meeting we all must be present	2026-09-09 06:37:11.586	994e829d-7290-444e-95f9-37329e2f9e57	09a54007-7ee3-49dd-be36-87f997e14e0f	2026-09-09 06:34:53.822	2026-09-09 06:37:11.604
9e99bc4d-05e5-420f-a723-57d0ca9a9e47	Sick Leave	2026-09-11	2026-09-12	I am feeling unwell and would like to request sick leave to recover and take proper rest.	APPROVED	\N	2026-09-10 10:01:54.15	15c2b6b0-b397-42f7-a5c8-610ecc9a456e	\N	2026-09-10 09:59:56.727	2026-09-10 10:01:54.158
aa396a8e-8de6-439b-9fab-2fd5b2d74ddc	Other Leave	2026-09-12	2026-09-18	Grandmother funeral	APPROVED	\N	2026-09-11 05:50:09.105	38c434a6-d184-4f7a-be0f-3a40c5928cff	cdfeb012-9ccc-4953-9488-ab6ace81649f	2026-09-11 05:48:57.827	2026-09-11 05:50:09.108
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, title, description, type, read, "createdAt", "userId") FROM stdin;
ed1040ca-42e7-4c4b-b217-0a3713d02a47	Employee added	Ketan Prajapat was added to Engineering.	employee	t	2026-09-01 12:33:58.156	cmsyh065r0002wkjh77azh9m7
cmsymt6yv0001ocjhmgyw3tcm	Employee added	Krupa Sodagar was added to Human Resources.	employee	t	2026-08-18 12:21:19.112	cmsyh065r0002wkjh77azh9m7
80186b42-16f3-4035-9c77-e9f0bdb1c801	Employee updated	Ketan Prajapat's profile was updated.	employee	t	2026-09-01 12:58:10.414	cmsyh065r0002wkjh77azh9m7
cmszpkpmc0000zgjhuhl0auyx	Employee added	Liza Satasiya was added to Engineering.	employee	t	2026-08-19 06:26:28.404	cmsyh065r0002wkjh77azh9m7
cmszpm5co0001zgjh511doimt	Employee added	Rohit Shah was added to Engineering.	employee	t	2026-08-19 06:27:35.448	cmsyh065r0002wkjh77azh9m7
cmszpy7r40002zgjh6f18f1x0	Employee added	Heer Limbachiya was added to Design.	employee	t	2026-08-19 06:36:58.432	cmsyh065r0002wkjh77azh9m7
cmszq0h1x0003zgjh45mofm69	Settings changed	Appearance set to dark mode.	system	t	2026-08-19 06:38:43.797	cmsyh065r0002wkjh77azh9m7
a3ba95ac-0e16-455b-9640-9afedb39cdb5	Role updated	Rohit Shah's role is now SUPER ADMIN.	employee	t	2026-09-02 08:59:44.192	cmsyh065r0002wkjh77azh9m7
cmszq3c6w0004zgjhsi8f42sy	Employee updated	Heer Limbachiya's profile was updated.	employee	t	2026-08-19 06:40:57.464	cmsyh065r0002wkjh77azh9m7
cmszwnj090000kgjhkd0rb1lh	Settings changed	Appearance set to dark mode.	system	t	2026-08-19 09:44:37.113	cmsyh065r0002wkjh77azh9m7
cmszwnjfy0001kgjh4rncp7fz	Settings changed	Appearance set to light mode.	system	t	2026-08-19 09:44:37.678	cmsyh065r0002wkjh77azh9m7
cmszx72920002kgjht1gzo4oe	Employee added	Drashti Thakkar was added to Engineering.	employee	t	2026-08-19 09:59:48.518	cmsyh065r0002wkjh77azh9m7
9af6f682-8e09-4346-96ca-6ee62f696f40	Role updated	Ketan Prajapat's role is now EMPLOYEE.	employee	t	2026-09-03 05:58:22.769	cmsyh065r0002wkjh77azh9m7
cmt65h9ak0000usjh2mwg7isd	Employee added	Pratham Parikh was added to Engineering.	employee	t	2026-08-23 18:38:18.188	cmsyh065r0002wkjh77azh9m7
33491183-9919-4784-bb27-dc32236d11c8	Role updated	Ketan Prajapat's role is now HR ADMIN.	employee	t	2026-09-03 05:58:20.545	cmsyh065r0002wkjh77azh9m7
048ac034-7353-4e78-9077-38c56cdba7cd	Role updated	Ketan Prajapat's role is now SUPER ADMIN.	employee	t	2026-09-03 05:58:18.616	cmsyh065r0002wkjh77azh9m7
cmt65hna20001usjhiitry92q	Settings changed	Appearance set to dark mode.	system	t	2026-08-23 18:38:36.314	cmsyh065r0002wkjh77azh9m7
cmt65hnya0002usjhvxj6y47s	Settings changed	Appearance set to light mode.	system	t	2026-08-23 18:38:37.186	cmsyh065r0002wkjh77azh9m7
9fb97181-19ea-49a6-9e71-e707fd6561fa	Employee added	Mann Gandhi was added to Design.	employee	t	2026-09-03 08:41:18.562	15c2b6b0-b397-42f7-a5c8-610ecc9a456e
f3fe399e-bc61-4ff0-a706-10415b0058f7	Employee added	Dev Chauhan was added to Engineering.	employee	t	2026-08-24 09:13:03.27	cmsyh065r0002wkjh77azh9m7
12159a72-b024-4448-ba03-ac3ea4008f1d	Employee updated	Mann Gandhi's profile was updated.	employee	t	2026-09-07 01:46:06.653	cmsyh065r0002wkjh77azh9m7
3af5be1d-84a2-4045-8fea-b8d7409b50ba	Profile updated	Your profile information was saved.	system	t	2026-09-07 01:52:32.571	cmsyh065r0002wkjh77azh9m7
15ef8837-1b54-43a7-a15d-03393b05a8c6	Employee updated	Dev Chauhan's profile was updated.	employee	t	2026-08-24 09:25:34.833	cmsyh065r0002wkjh77azh9m7
0fe38e35-238f-42f3-920d-12e0b3493605	Employee updated	Rushi Gandhi's profile was updated.	employee	t	2026-08-24 09:26:04.699	cmsyh065r0002wkjh77azh9m7
a7e542d7-6ced-45cb-b770-d4587ae0b907	Employee updated	Rushi Gandhi's profile was updated.	employee	t	2026-08-24 09:26:26.57	cmsyh065r0002wkjh77azh9m7
bb741851-0b84-4e4b-9be5-fa552704e972	Employee updated	Dev Chauhan's profile was updated.	employee	t	2026-08-24 09:27:19.505	cmsyh065r0002wkjh77azh9m7
77a1ca50-2273-46b7-9d2b-54b6d0764b00	Employee updated	Rushi Gandhi's profile was updated.	employee	t	2026-09-07 01:53:25.889	cmsyh065r0002wkjh77azh9m7
75426d97-cba0-44bd-866b-8284124cef0e	Employee updated	Pratham Parikh's profile was updated.	employee	t	2026-08-24 09:31:40.615	cmsyh065r0002wkjh77azh9m7
9e4928b0-81a0-4296-a2d9-8dcc0321a957	Employee updated	Dev Chauhan's profile was updated.	employee	t	2026-08-25 09:47:24.368	cmsyh065r0002wkjh77azh9m7
4090cb74-31ba-44ad-8523-398eb8340726	Leave Application Approved	Your Work From Home request from 2026-09-15 to 2026-09-17 was approved.	success	f	2026-09-08 06:33:19.412	b7ddda6d-82c4-414b-9e19-dca658ebfe4f
a0da9692-1906-4f1f-b44d-300ccde0b06e	Employee updated	Dev Chauhan's profile was updated.	employee	t	2026-08-25 09:47:49.374	cmsyh065r0002wkjh77azh9m7
315df403-ebe0-4a28-b081-06ad3c4e4271	Employee updated	Rushi Gandhi's profile was updated.	employee	t	2026-08-25 10:18:35.774	cmsyh065r0002wkjh77azh9m7
42019c89-6b20-4cf0-a0b2-a04d2f1a5226	New Leave Application	Pratham Parikh applied for Casual Leave (2026-09-25 to 2026-09-26).	info	t	2026-09-08 06:36:42.737	cmsyh065r0002wkjh77azh9m7
88d8c8a6-a527-4074-9bcb-cd49b51220b4	New Leave Application	Pratham Parikh applied for Work From Home (2026-09-15 to 2026-09-17).	info	t	2026-09-08 06:33:19.301	cmsyh065r0002wkjh77azh9m7
f9b815c4-edf3-4f6e-8a1b-106b9d4789f7	Employee updated	Dev Chauhan's profile was updated.	employee	t	2026-08-25 10:20:49.624	cmsyh065r0002wkjh77azh9m7
43538ece-9f9c-455c-9188-2457d4cc0279	Employee updated	Rushi Gandhi's profile was updated.	employee	t	2026-08-25 10:30:18.548	cmsyh065r0002wkjh77azh9m7
0b5fa7ff-285e-4ea5-8147-bc1f7f05147a	Leave Application Approved	Your Work From Home request from 2026-09-09 to 2026-09-11 was approved.	success	t	2026-09-08 06:40:10.927	cmsylxc7g0002mkjh6yjq9fju
3c7076ec-6d93-44c9-ab8b-09be9223c94e	Leave Application Rejected	Your Sick Leave request from 2026-09-09 to 2026-09-10 was rejected.	danger	t	2026-09-08 06:41:29.154	cmsylxc7g0002mkjh6yjq9fju
46d6f929-4b88-4840-8eb0-2cb5cf755420	Settings changed	Appearance set to dark mode.	system	t	2026-08-25 10:36:31.311	cmsyh065r0002wkjh77azh9m7
328c8302-a65f-4862-86cc-8b78070c390c	Settings changed	Appearance set to light mode.	system	t	2026-08-25 10:36:32.478	cmsyh065r0002wkjh77azh9m7
9dcaa028-72da-44f4-8104-54275f670602	Settings changed	Appearance set to dark mode.	system	t	2026-08-25 10:36:59.858	cmsyh065r0002wkjh77azh9m7
29070709-edc5-4f04-aed8-fa58125e58bd	Settings changed	Appearance set to light mode.	system	t	2026-08-25 10:37:00.827	cmsyh065r0002wkjh77azh9m7
ca21b8c0-c989-480e-be7e-3973bd558d52	Settings changed	Appearance set to dark mode.	system	t	2026-08-25 10:37:01.804	cmsyh065r0002wkjh77azh9m7
c8d1981e-277d-426c-a380-17fe72e46eba	Settings changed	Appearance set to light mode.	system	t	2026-08-25 10:37:02.142	cmsyh065r0002wkjh77azh9m7
65aa03c5-af74-4aeb-84bb-b38e39b6dda6	Settings changed	Appearance set to dark mode.	system	t	2026-08-25 10:37:02.445	cmsyh065r0002wkjh77azh9m7
fec8d6ea-f67f-4ea5-bdde-39fdb7b00a7f	Settings changed	Appearance set to light mode.	system	t	2026-08-25 10:37:02.781	cmsyh065r0002wkjh77azh9m7
c3dd2ce0-9ca0-45f5-801c-4d836396c47c	Settings changed	Appearance set to dark mode.	system	t	2026-08-25 10:37:03.101	cmsyh065r0002wkjh77azh9m7
d3bcf834-9a30-4777-b1f5-bcceedbd4961	Settings changed	Appearance set to light mode.	system	t	2026-08-25 10:37:03.372	cmsyh065r0002wkjh77azh9m7
00cd415f-cf53-41d8-91cb-50f2bd645bf7	Settings changed	Appearance set to dark mode.	system	t	2026-08-25 10:37:03.695	cmsyh065r0002wkjh77azh9m7
68ce2392-3685-420f-9e74-7866dabe7131	Settings changed	Appearance set to light mode.	system	t	2026-08-25 10:37:03.966	cmsyh065r0002wkjh77azh9m7
adfd46f5-a977-4150-96c3-3f9769ee6efb	Settings changed	Appearance set to dark mode.	system	t	2026-08-25 10:37:04.288	cmsyh065r0002wkjh77azh9m7
fd23d07f-d920-4bf5-acd9-af950ba0c708	Settings changed	Appearance set to light mode.	system	t	2026-08-25 10:37:04.574	cmsyh065r0002wkjh77azh9m7
dc13739f-8935-4db6-84f2-f353e45fc460	Settings changed	Appearance set to dark mode.	system	t	2026-08-25 10:37:04.853	cmsyh065r0002wkjh77azh9m7
a4a4e5f2-a286-40ff-9dd0-498eca3e2048	Settings changed	Appearance set to light mode.	system	t	2026-08-25 10:37:05.203	cmsyh065r0002wkjh77azh9m7
9cebbed9-424b-428f-bb8b-8d5f1809e0b2	Employee replaced	Jigna Gandhi's profile was completely replaced.	employee	t	2026-09-15 06:16:27.178	cmsyh065r0002wkjh77azh9m7
3de4f0fa-64b0-4231-9217-ab54bbe00edc	Employee updated	Rushi Gandhi's profile was updated.	employee	t	2026-08-26 06:31:35.304	cmsyh065r0002wkjh77azh9m7
596a4a27-e65f-4481-930f-006a1122c7cb	Employee deleted	Rushi Gandhi was removed from the directory.	employee	t	2026-09-16 07:40:15.419	cmsyh065r0002wkjh77azh9m7
d2c62d89-5810-461e-94c5-755ac99a89b7	Employee updated	Ketan Prajapat's profile was updated.	employee	t	2026-09-01 12:58:48.427	cmsyh065r0002wkjh77azh9m7
3039b94c-f672-4920-9091-7a4e50673b8b	Employee updated	Heer Limbachiya's profile was updated.	employee	t	2026-08-26 06:35:36.075	cmsyh065r0002wkjh77azh9m7
f1ed97bc-7ef3-4e67-b284-6c66eabddd2f	Employee updated	Krupa Sodagar's profile was updated.	employee	t	2026-08-26 06:35:24.373	cmsyh065r0002wkjh77azh9m7
44cb7948-f952-47a1-ac7f-e9b21b7629e7	Employee updated	Rushi Gandhi's profile was updated.	employee	t	2026-08-26 06:34:51.59	cmsyh065r0002wkjh77azh9m7
39652cfc-b839-4d9b-b304-c4d9ead62f38	Employee added	Hardik Panchal was added to Design.	employee	t	2026-08-26 12:20:22.655	cmsyh065r0002wkjh77azh9m7
164f0f95-c0fa-4e99-8f2e-172b895750a9	Role updated	Ketan Prajapat's role is now HR ADMIN.	employee	t	2026-09-02 07:09:26.894	cmsyh065r0002wkjh77azh9m7
dabbed35-60de-4e7b-a18a-9d8058cbb34b	Password changed	Your account password was updated.	system	t	2026-08-27 07:05:50.594	cmsyh065r0002wkjh77azh9m7
97791077-0e7b-4993-b1d3-8e081a7aa00b	Employee deleted	Mann Gandhi was removed from the directory.	employee	t	2026-09-03 08:37:03.18	cmsyh065r0002wkjh77azh9m7
8c315137-0187-4e83-9c53-940e97b193f6	Employee updated	Atman Mehta's profile was updated.	employee	t	2026-08-27 07:13:45.928	cmsyh065r0002wkjh77azh9m7
b4b5bf14-dc20-4b29-920c-9c625b57b488	Employee added	Atman Mehta was added to Engineering.	employee	t	2026-08-27 07:13:32.065	cmsyh065r0002wkjh77azh9m7
a39e87e2-b892-4095-9427-8bb75b1891f5	Employee updated	Atman Mehta's profile was updated.	employee	t	2026-08-27 11:09:33.377	cmsyh065r0002wkjh77azh9m7
f7c2209f-cd1d-438b-8aab-2138b5d76081	Employee deleted	Mann Gandhi was removed from the directory.	employee	t	2026-09-03 08:41:34.082	cmsyh065r0002wkjh77azh9m7
1e894768-f259-47f7-b5f2-ad631f95511b	Settings changed	Appearance set to dark mode.	system	t	2026-08-31 11:54:15.96	cmsyh065r0002wkjh77azh9m7
74d1124b-63a5-4f44-9190-5c79dfe448eb	Settings changed	Appearance set to light mode.	system	t	2026-08-31 11:54:23.468	cmsyh065r0002wkjh77azh9m7
495725c9-265f-499f-aed0-b8cd89147ea6	Employee updated	Kathan Gandhi's profile was updated.	employee	t	2026-09-07 01:49:38.614	cmsyh065r0002wkjh77azh9m7
08f34847-0644-41e5-96c6-89d89e37d1a5	Settings changed	Appearance set to light mode.	system	t	2026-09-01 12:08:35.308	cmsyh065r0002wkjh77azh9m7
1d81fa0b-34b3-4dd0-b66e-ae25edaacee8	Settings changed	Appearance set to dark mode.	system	t	2026-09-01 12:08:33.325	cmsyh065r0002wkjh77azh9m7
28803f6f-ae55-4e84-b08e-241ff08c1cd1	Employee updated	Dev Chauhan's profile was updated.	employee	t	2026-09-07 01:53:12.361	cmsyh065r0002wkjh77azh9m7
c4bd3b9e-536b-4299-a0a3-02198dd87696	Role updated	Rohit Shah's role is now SUPER ADMIN.	employee	t	2026-09-01 12:23:05.95	cmsyh065r0002wkjh77azh9m7
ea791093-8fbd-4201-9f45-42812765fe9d	Role updated	Rohit Shah's role is now EMPLOYEE.	employee	t	2026-09-01 12:23:19.425	cmsyh065r0002wkjh77azh9m7
4b5b7adc-55c5-4be5-8081-0aa14947fb05	Employee deleted	Dhanvin Pandya was removed from the directory.	employee	t	2026-09-07 12:34:45.901	cmsyh065r0002wkjh77azh9m7
985e8ab6-2844-44fd-9191-3f12c77f49de	Leave Application Approved	Your Work From Home request from 2026-09-20 to 2026-09-22 was approved.	success	f	2026-09-08 06:36:42.694	b7ddda6d-82c4-414b-9e19-dca658ebfe4f
a9a2a52c-ffe3-4180-894c-f8004e46db8e	Leave Application Rejected	Your Casual Leave request from 2026-09-25 to 2026-09-26 was rejected. Note: Team coverage required during deployment window	danger	f	2026-09-08 06:36:42.767	b7ddda6d-82c4-414b-9e19-dca658ebfe4f
f94624c6-a6c2-4da7-8865-4f45938e614a	New Leave Application	Pratham Parikh applied for Work From Home (2026-09-20 to 2026-09-22).	info	t	2026-09-08 06:36:42.445	cmsyh065r0002wkjh77azh9m7
765ec3f2-c257-40c2-9188-9a7c84ab8da1	New Leave Application	Dhanvin Pandya applied for Work From Home (2026-09-09 to 2026-09-11).	info	t	2026-09-08 06:39:10.914	cmsyh065r0002wkjh77azh9m7
e6539f19-4962-4804-9c62-aaf18a349634	New Leave Application	Dhanvin Pandya applied for Sick Leave (2026-09-09 to 2026-09-10).	info	t	2026-09-08 06:41:00.602	cmsyh065r0002wkjh77azh9m7
1775ba20-b666-40c8-9049-4d0a7fad482c	New Leave Application	Mann Gandhi applied for Casual Leave (2026-09-09 to 2026-09-11).	info	t	2026-09-08 06:46:54.408	cmsyh065r0002wkjh77azh9m7
27e952e0-a0fe-4ae3-b03b-848614e581a0	Leave Application Approved	Your Casual Leave request from 2026-09-09 to 2026-09-11 was approved.	success	t	2026-09-08 06:47:37.709	994e829d-7290-444e-95f9-37329e2f9e57
0f3799a1-7dc8-44ac-b666-08e7c99ebbcd	New Leave Application	Mann Gandhi applied for Work From Home (2026-09-15 to 2026-09-16).	info	t	2026-09-09 06:34:53.869	cmsyh065r0002wkjh77azh9m7
c95f62df-cf24-482c-b4c8-30066461f5e6	Leave Application Rejected	Your Work From Home request from 2026-09-15 to 2026-09-16 was rejected. Note: On this date, it will be an important meeting we all must be present	danger	t	2026-09-09 06:37:11.621	994e829d-7290-444e-95f9-37329e2f9e57
c1d56732-8a1c-4534-8f92-be015656ffe7	New Leave Application	Rushi Gandhi applied for Sick Leave (2026-09-11 to 2026-09-12).	info	t	2026-09-10 09:59:56.757	cmsyh065r0002wkjh77azh9m7
37379784-828d-4734-b617-04880f3a9637	Leave Application Approved	Your Sick Leave request from 2026-09-11 to 2026-09-12 was approved.	success	t	2026-09-10 10:01:54.171	15c2b6b0-b397-42f7-a5c8-610ecc9a456e
23c8cde7-2d34-427a-9f05-5ae94850c142	Leave Application Approved	Your Other Leave request from 2026-09-12 to 2026-09-18 was approved.	success	t	2026-09-11 05:50:09.124	38c434a6-d184-4f7a-be0f-3a40c5928cff
894f583d-f8e7-48c1-9d14-fee5eb6d547c	Settings changed	Appearance set to light mode.	system	t	2026-09-15 08:47:25.266	15c2b6b0-b397-42f7-a5c8-610ecc9a456e
88009cab-6eac-4a6d-943f-11e7ecb03dbb	Settings changed	Appearance set to dark mode.	system	t	2026-09-15 08:47:24.358	15c2b6b0-b397-42f7-a5c8-610ecc9a456e
1a58e4d7-767c-4784-988f-239cadcf6b1b	Employee replaced	Rushi Gandhi's profile was completely replaced.	employee	t	2026-09-16 07:25:07.894	15c2b6b0-b397-42f7-a5c8-610ecc9a456e
d811aa9e-90ef-4c24-827d-840a622b3bd3	Employee deleted	Rushi Gandhi was removed from the directory.	employee	t	2026-09-16 08:49:41.861	cmsyh065r0002wkjh77azh9m7
9044d6c3-c4b2-4c14-8654-be6315f7b45c	Employee deleted	ADITYASINH PADHIYAR was removed from the directory.	employee	t	2026-09-16 09:07:12.997	cmsyh065r0002wkjh77azh9m7
a76e216c-9369-4be9-94da-5c1892c7545f	Employee deleted	ADITYASINH PADHIYAR was removed from the directory.	employee	t	2026-09-16 12:04:25.604	cmsyh065r0002wkjh77azh9m7
3f71afa0-429e-497f-8998-03fd31f0da78	Employee deleted	Rushi Gandhi was removed from the directory.	employee	t	2026-09-16 12:11:13.866	cmsyh065r0002wkjh77azh9m7
0c39dc29-b179-4f58-9e27-c4a6b606c9cd	Employee deleted	ADITYASINH PADHIYAR was removed from the directory.	employee	t	2026-09-16 12:11:10.683	cmsyh065r0002wkjh77azh9m7
2655e62e-2a92-4052-b831-0dac494230e2	Role Assignment Updated	Your system role has been updated to Manager.	employee	t	2026-09-17 07:10:35.542	994e829d-7290-444e-95f9-37329e2f9e57
e81fb78f-11d5-4ca5-8aa0-358711d7b6d3	Role Assignment Updated	Your system role has been updated to Employee.	employee	t	2026-09-17 07:10:49.526	994e829d-7290-444e-95f9-37329e2f9e57
bde06118-5370-46ff-90ab-43b44a004d40	Role updated	Mann Gandhi's role is now employee.	employee	t	2026-09-17 07:10:49.538	cmsyh065r0002wkjh77azh9m7
59974df5-9269-490a-a9f4-c3e5ed3679b0	Role updated	Mann Gandhi's role is now manager.	employee	t	2026-09-17 07:10:35.596	cmsyh065r0002wkjh77azh9m7
136f664c-e6cf-448b-b0a3-9272e078996c	Employee replaced	Kathan Gandhi's profile was completely replaced.	employee	t	2026-09-18 09:58:13.188	cmsyh065r0002wkjh77azh9m7
d346f506-4240-456d-904b-8e7f406f9907	Employee replaced	Dhruv Kavathiya's profile was completely replaced.	employee	t	2026-09-18 10:13:36.09	cmsyh065r0002wkjh77azh9m7
6785f919-f0d1-4694-a7e1-f5c90c505530	Role updated	Mann Gandhi's role is now hr admin.	employee	t	2026-09-22 09:05:25.251	cmsyh065r0002wkjh77azh9m7
14db6956-bac7-4e4f-9274-8388b277f4f6	Role Assignment Updated	Your system role has been updated to Hr Admin.	employee	t	2026-09-22 09:05:25.224	994e829d-7290-444e-95f9-37329e2f9e57
181b0036-663d-45f0-9f1b-fa0c4d945c9e	Role updated	Mann Gandhi's role is now employee.	employee	t	2026-09-22 09:05:49.785	cmsyh065r0002wkjh77azh9m7
15e6f072-fae9-4dfc-bf58-6fb9c0cfa09b	Role Assignment Updated	Your system role has been updated to Employee.	employee	t	2026-09-22 09:05:49.777	994e829d-7290-444e-95f9-37329e2f9e57
e989a28e-796c-4fad-bfeb-5e110e63af89	Employee deleted	Dhruv Kavathiya was removed from the directory.	employee	t	2026-09-22 09:46:30.195	cmsyh065r0002wkjh77azh9m7
b69d6998-0c7a-498e-ac81-d012e0abd069	Employee added	Dhruv Kavathiya was added to Sales.	employee	t	2026-09-22 11:34:02.573	cmsyh065r0002wkjh77azh9m7
8330c474-4648-463c-8ca8-4b2fc1924e49	Role Assignment Updated	Your system role has been updated to Manager.	employee	t	2026-09-22 11:55:20.555	994e829d-7290-444e-95f9-37329e2f9e57
d44d70ff-b957-4f87-ac17-63d1ef7e40f9	Role Assignment Updated	Your system role has been updated to Employee.	employee	t	2026-09-22 11:56:58.358	994e829d-7290-444e-95f9-37329e2f9e57
387641c4-b085-4080-8c7c-740f06385af6	Role updated	Mann Gandhi's role is now employee.	employee	t	2026-09-22 11:56:58.376	cmsyh065r0002wkjh77azh9m7
5d16233f-0e18-4169-b90a-d463c6b47e28	Role updated	Mann Gandhi's role is now manager.	employee	t	2026-09-22 11:55:20.575	cmsyh065r0002wkjh77azh9m7
be61bc23-9655-4eff-ab55-45023a8cf643	Employee deleted	ADITYASINH PADHIYAR was removed from the directory.	employee	t	2026-09-23 09:23:55.618	cmsyh065r0002wkjh77azh9m7
73558b44-bfbc-409b-99ed-430115c94051	Employee deleted	ADITYASINH PADHIYAR was removed from the directory.	employee	t	2026-09-23 09:21:34.936	cmsyh065r0002wkjh77azh9m7
b60f8cda-c68c-4d51-a905-60a396d25e54	Employee deleted	ADITYASINH PADHIYAR was removed from the directory.	employee	t	2026-09-23 09:44:56.214	cmsyh065r0002wkjh77azh9m7
c12c1979-a1f9-41d9-8360-426539bfe2aa	Employee deleted	Rohit Shah was removed from the directory.	employee	t	2026-09-11 05:50:56.202	cmsyh065r0002wkjh77azh9m7
33f7f897-7130-497a-bd18-025c6c1a8a5b	New Leave Application	Rohit Shah applied for Other Leave (2026-09-12 to 2026-09-18).	info	t	2026-09-11 05:48:57.844	cmsyh065r0002wkjh77azh9m7
4b4e3158-62d7-4404-84d9-5609076addcf	New Leave Application	Dhruv Kavathiya applied for Casual Leave (2026-09-21 to 2026-09-23).	info	t	2026-09-15 09:29:27.96	cmsyh065r0002wkjh77azh9m7
17c980d1-da7d-4fea-b5d9-fbda07cae3a8	New Leave Application	Dhruv Kavathiya applied for Sick Leave (2026-09-16 to 2026-09-16).	info	t	2026-09-15 10:02:34.771	cmsyh065r0002wkjh77azh9m7
6e9ef8b1-729e-4e78-a2b3-c9070c9697e7	Settings changed	Appearance set to light mode.	system	t	2026-09-15 12:11:59.126	cmsyh065r0002wkjh77azh9m7
b26a98bf-c6dc-45eb-843b-9aea31c524bd	Settings changed	Appearance set to dark mode.	system	t	2026-09-15 12:11:58.465	cmsyh065r0002wkjh77azh9m7
6fea127a-374d-40d2-87c0-717afaf0a80a	New Leave Application	Dhruv Kavathiya applied for Sick Leave (2026-09-16 to 2026-09-16).	info	t	2026-09-15 10:02:34.805	15c2b6b0-b397-42f7-a5c8-610ecc9a456e
8f02b512-ec77-44c3-80b9-32d59588f5ef	Role updated	Liza Satasiya's role is now hr admin.	employee	t	2026-09-11 07:03:36.905	cmsyh065r0002wkjh77azh9m7
d7b4f5b3-27c9-4ca4-850e-29fbb49728ca	Role updated	Drashti Thakkar's role is now hr admin.	employee	t	2026-09-11 07:03:34.641	cmsyh065r0002wkjh77azh9m7
b2b999b7-b4aa-4d5d-8b31-7660e482da46	Role updated	Pratham Parikh's role is now hr admin.	employee	t	2026-09-11 07:03:32.863	cmsyh065r0002wkjh77azh9m7
4446959d-b866-4dd4-bc69-f7eeba692806	Role updated	Atman Mehta's role is now manager.	employee	t	2026-09-11 07:03:28.892	cmsyh065r0002wkjh77azh9m7
fe8e6599-8923-4f94-80d7-bfdc94e6cf6c	Role updated	Kathan Gandhi's role is now hr admin.	employee	t	2026-09-11 07:03:27.254	cmsyh065r0002wkjh77azh9m7
60bee8d7-03c2-49f5-9839-58ce7d6a8c89	Role updated	Kathan Gandhi's role is now super admin.	employee	t	2026-09-11 07:03:26.131	cmsyh065r0002wkjh77azh9m7
6596199e-ce2b-4542-83dc-b4e77af7e7ca	Role updated	Rohit Shah's role is now manager.	employee	t	2026-09-11 07:03:24.583	cmsyh065r0002wkjh77azh9m7
4c77dc51-2c25-489c-aa8d-5a3533457610	Role updated	Rohit Shah's role is now manager.	employee	t	2026-09-11 07:03:23.453	cmsyh065r0002wkjh77azh9m7
b300c7b4-a15a-48ae-861b-302352845397	Role updated	Dev Chauhan's role is now super admin.	employee	t	2026-09-11 07:03:14.641	cmsyh065r0002wkjh77azh9m7
1689ddd2-bee6-4fd2-8645-dcaf64ba9370	Role updated	Dev Chauhan's role is now super admin.	employee	t	2026-09-11 07:03:16.375	cmsyh065r0002wkjh77azh9m7
0211a753-76a9-40eb-98ce-061e6fd71a48	Role updated	Dev Chauhan's role is now hr admin.	employee	t	2026-09-11 07:03:18.587	cmsyh065r0002wkjh77azh9m7
5862f99a-6948-4d19-8414-5066f1f57b52	New Leave Application	Dhruv Kavathiya applied for Casual Leave (2026-09-21 to 2026-09-23).	info	t	2026-09-15 09:29:27.983	15c2b6b0-b397-42f7-a5c8-610ecc9a456e
09ae9385-7bb2-4dd6-9712-4e49dc2bf696	Employee replaced	Rushi Gandhi's profile was completely replaced.	employee	t	2026-09-16 07:24:57.432	15c2b6b0-b397-42f7-a5c8-610ecc9a456e
306f1dc3-d0d0-4fa7-8177-427a1512b4cb	Role updated	Drashti Thakkar's role is now employee.	employee	t	2026-09-11 07:04:21.467	cmsyh065r0002wkjh77azh9m7
ef1a053f-751b-4cef-a328-bd30ac8c66b1	Role updated	Liza Satasiya's role is now employee.	employee	t	2026-09-11 07:04:25.072	cmsyh065r0002wkjh77azh9m7
8e6cf2d0-aabf-472f-a5ef-83b2d5d45d67	Role updated	Pratham Parikh's role is now employee.	employee	t	2026-09-11 07:04:19.957	cmsyh065r0002wkjh77azh9m7
da797973-2aa6-45d0-a8c8-5fb013c117f2	Role updated	Dev Chauhan's role is now employee.	employee	t	2026-09-11 07:04:18.477	cmsyh065r0002wkjh77azh9m7
4c6a7910-42ed-4efb-8066-de2cde474b76	Role updated	Rohit Shah's role is now employee.	employee	t	2026-09-11 07:04:10.771	cmsyh065r0002wkjh77azh9m7
bcf570e9-4b35-4c80-a35b-64086a244038	Role updated	Kathan Gandhi's role is now employee.	employee	t	2026-09-11 07:04:04.153	cmsyh065r0002wkjh77azh9m7
1af905bb-590e-46c6-a77c-66797ba8a5ba	Role updated	Rohit Shah's role is now hr admin.	employee	t	2026-09-11 07:10:35.956	cmsyh065r0002wkjh77azh9m7
ad49673d-4f6d-41d8-926e-ade8043c3e6f	Role updated	Rohit Shah's role is now employee.	employee	t	2026-09-11 07:10:43.999	cmsyh065r0002wkjh77azh9m7
fd10b7c1-ced3-4900-9c54-b946b9948a1e	Role updated	Dhanvin Pandya's role is now employee.	employee	t	2026-09-11 07:18:48.615	cmsyh065r0002wkjh77azh9m7
44a52390-db25-411b-b6bc-241a7f79f190	Role updated	Dhanvin Pandya's role is now hr admin.	employee	t	2026-09-11 07:18:44.081	cmsyh065r0002wkjh77azh9m7
f5d315c5-823b-4ac3-8d58-5935648231c1	Role updated	Mann Gandhi's role is now manager.	employee	t	2026-09-13 17:52:09.809	cmsyh065r0002wkjh77azh9m7
5b73498f-869a-4455-84e0-7cb157c51dad	Role updated	Mann Gandhi's role is now employee.	employee	t	2026-09-13 17:53:53.573	cmsyh065r0002wkjh77azh9m7
a9bc2987-ed8c-4c7d-b2a0-fe392bf154cb	Role updated	Mann Gandhi's role is now employee.	employee	t	2026-09-13 17:55:30.377	cmsyh065r0002wkjh77azh9m7
3c191995-cd6a-4567-b3f3-e27c69ce7c9e	Role updated	Mann Gandhi's role is now manager.	employee	t	2026-09-13 17:55:23.764	cmsyh065r0002wkjh77azh9m7
b999dd73-4242-4f57-b921-a8f72422b7c8	Role updated	Dhanvin Pandya's role is now manager.	employee	t	2026-09-13 17:55:08.817	cmsyh065r0002wkjh77azh9m7
7e87c865-ecf5-440d-a162-376efee3c903	Role updated	Dhanvin Pandya's role is now hr admin.	employee	t	2026-09-13 17:54:52.056	cmsyh065r0002wkjh77azh9m7
12d5e7f0-7904-4c79-9a7b-aca55cccb043	Role updated	Jigna Gandhi's role is now employee.	employee	t	2026-09-13 17:57:10.398	cmsyh065r0002wkjh77azh9m7
3d4082e1-73b4-4ce0-b4de-4ed5ea4b9007	Role updated	Jigna Gandhi's role is now manager.	employee	t	2026-09-13 17:56:59.363	cmsyh065r0002wkjh77azh9m7
cc5847f4-47a9-4cdb-9ed8-5acd78ae26fc	Employee replaced	Jigna Gandhi's profile was completely replaced.	employee	t	2026-09-13 18:05:56.514	cmsyh065r0002wkjh77azh9m7
78c6cf3e-e34a-4534-b978-48da3e26705a	Role updated	Dhruv Kavathiya's role is now employee.	employee	t	2026-09-14 06:20:38.468	cmsyh065r0002wkjh77azh9m7
cd579c3a-702d-4062-a890-12f9d4847284	Role updated	Dhruv Kavathiya's role is now hr admin.	employee	t	2026-09-14 06:20:12.025	cmsyh065r0002wkjh77azh9m7
3c33a832-c859-47e9-aff2-5b9bab3ea4e2	Role updated	Dhruv Kavathiya's role is now employee.	employee	t	2026-09-14 09:52:25.795	cmsyh065r0002wkjh77azh9m7
456d8343-4c7d-4c8b-84ac-5e182609edbf	Role updated	Dhruv Kavathiya's role is now manager.	employee	t	2026-09-14 09:52:13.238	cmsyh065r0002wkjh77azh9m7
117b1d88-704d-452d-84c2-2dbbc68c2706	Role updated	Dhruv Kavathiya's role is now employee.	employee	t	2026-09-14 18:07:32.051	cmsyh065r0002wkjh77azh9m7
8473fc71-9e4c-4f70-839f-95b26358c1ae	Role updated	Dhruv Kavathiya's role is now hr admin.	employee	t	2026-09-14 18:06:49.047	cmsyh065r0002wkjh77azh9m7
\.


--
-- Data for Name: user_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_settings (id, "notifyEmployee", "notifySystem", "notifyLogin", "userId") FROM stdin;
cmsylxc7n0003mkjhrhbf0thz	t	t	t	cmsylxc7g0002mkjh6yjq9fju
d133030d-6319-4867-a462-f26fc5a561d0	t	t	t	d8695881-ed27-455a-8aa2-66c0b479f119
4b7a6240-66ab-4d3c-ab42-028688a8ecb7	t	t	t	7e2cc038-c86e-43c3-b97a-3fa9d1b5648a
2af715d4-8597-4b7f-b641-1fa595fb3ef0	t	t	t	5d58ba82-a176-4d8f-b467-11d41693497b
cmsyh06620003wkjh6ydv8659	f	f	f	cmsyh065r0002wkjh77azh9m7
e343470e-9e06-4ed9-b66d-47331b150818	t	t	t	b7ddda6d-82c4-414b-9e19-dca658ebfe4f
e9c8c9c7-137a-42eb-a650-cba0eb6162d4	t	t	t	b1f2b526-aed5-42af-973e-504d59089af3
e6fd5e0f-bdb5-4241-93e5-941d7da183b6	t	t	t	38c434a6-d184-4f7a-be0f-3a40c5928cff
ca335b8c-8cbb-4cf1-8d4d-bd6a9d4c58e5	t	t	t	a49b9cf7-510b-4f86-89e7-2e49bc57cd4c
a4788e46-e408-4fa3-ae2a-baf77d552c2c	t	t	t	994e829d-7290-444e-95f9-37329e2f9e57
2657c4d6-8e1c-41cb-b723-8f7ab8f0818b	t	t	t	9e549c92-f874-4703-a012-cc6eaa7e8ce4
431e4aa0-5c78-4816-972c-a80174681e14	t	t	t	15c2b6b0-b397-42f7-a5c8-610ecc9a456e
22502457-5973-46a3-beea-94f83997087d	t	t	t	f42218d2-a1ed-4ac7-bdcd-8c4233a5c699
f4af2785-5cac-443b-94b0-beadcbee3dc5	t	t	t	a004dbe4-aaa4-4543-baea-f238420abfc4
364013f1-a480-4d9a-ad92-e73bdeea8aaf	t	t	t	249c8f2d-efdd-46e5-969d-5bc3cac445f5
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, "fullName", email, "passwordHash", "avatarSeed", "createdAt", "updatedAt", "profilePhoto", "isOnboarded", role, "authProvider", "emailVerified", "googleId") FROM stdin;
9e549c92-f874-4703-a012-cc6eaa7e8ce4	Jigna Gandhi	jigna@york.ie	$2b$12$HebJrE.oWAZSMTX.Ja7TAOQlSUbApztnKxamkR07s8DjWz8GvCnAS	Jigna Gandhi	2026-09-13 17:56:13.742	2026-09-13 17:57:10.39	\N	t	employee	local	f	\N
b7ddda6d-82c4-414b-9e19-dca658ebfe4f	Pratham Parikh	pratham@york.ie	$2b$12$19uLcFVroOkB/ji59MEvzOHLu4XA3trhrqzBj/afilhyL/soljcou	Pratham Parikh	2026-09-01 16:29:29.892	2026-09-01 16:29:29.892	\N	f	employee	local	f	\N
b1f2b526-aed5-42af-973e-504d59089af3	Ketan Prajapat	ketan@york.ie	$2b$12$TTZsn.332INyzOlKEIhf8.VnNysZJWjF/W8DeOALMU2rb/F2D0q9C	Ketan Prajapat	2026-09-02 07:48:44.632	2026-09-02 07:48:44.632	\N	f	employee	local	f	\N
f42218d2-a1ed-4ac7-bdcd-8c4233a5c699	Dhruv Kavathiya	dhruv@york.ie	$2b$12$pmCC8oUeVqipgczDgGaueOxevHJXF0CUP.r37q9XEegn4yWQlDGAe	Dhruv Kavathiya	2026-09-22 11:34:02.5	2026-09-22 11:34:02.5	\N	t	employee	local	f	\N
15c2b6b0-b397-42f7-a5c8-610ecc9a456e	Rushi Gandhi	rushigandhi215@gmail.com	$2b$12$HsdQyIjoKUGKCwiHxD.D1.WAqosSY7dqiTG78fgS5LVYgA4SoiKdi	Rushi Gandhi	2026-09-01 07:21:45.212	2026-09-25 07:54:14.314	https://lh3.googleusercontent.com/a/ACg8ocLie4jVReVgvMfeQ7gs__lrckQkF63gQxS-ICxm8jaS-ZH-nQ=s96-c	f	hr_admin	local	t	100817013039422748074
38c434a6-d184-4f7a-be0f-3a40c5928cff	Rohit Shah	rohit@york.ie	$2b$12$oBYkOiN/aXeG6ZIOc5wiF.cJNKOSKWs2V0rvlyYtN3taN4HAElmlq	Rohit Shah	2026-09-02 08:58:42.077	2026-09-11 05:47:33.699	\N	t	employee	local	f	\N
cmsylxc7g0002mkjh6yjq9fju	Dhanvin Pandya	dhanvin@york.ie	$2b$12$44Tcka4N/xIhX9MRivl5H.NFz/cZSOIs9NiKyF25KseWyIsYpwRRG	Dhanvin Pandya	2026-08-18 11:56:32.908	2026-09-13 17:55:08.801	\N	t	manager	local	f	\N
994e829d-7290-444e-95f9-37329e2f9e57	Mann Gandhi	mann@york.ie	$2b$12$0Z15H6JcJCcfgv1ahInQLuoNOjpzZk0aCCz7idFfrzCON5UYzexjO	Mann Gandhi	2026-09-03 08:51:19.674	2026-09-22 11:56:58.353	\N	t	employee	local	f	\N
a004dbe4-aaa4-4543-baea-f238420abfc4	Liza Satasiya	liza@york.ie	$2b$12$3SZbFzSeFKj.vS24gwanb.hgIFcRnJ6MoPWycOc0N3M0Ry4f5nYze	Liza Satasiya	2026-09-22 12:02:55.182	2026-09-22 12:02:55.182	\N	t	employee	local	f	\N
249c8f2d-efdd-46e5-969d-5bc3cac445f5	Rushi Gandhi	rushi@york.ie	$2b$12$MCBb42RnoqdkegcGvKLHUO55EFzIJUem9qRVuQPoPr6QgHYL4SFMe	Rushi Gandhi	2026-09-23 07:05:28.991	2026-09-23 07:05:28.991	\N	t	employee	local	f	\N
cmsyh065r0002wkjh77azh9m7	Rushi Gandhi	rushigandhi2005@gmail.com	$2b$12$v2Mjv1.tR8/WQeofSPOx4eTtmBylpjq7cS9WS6Bv1V1l6XtIPb70y	Rushi Gandhi	2026-08-18 09:38:46.96	2026-09-16 07:27:40.851	admin-1788745951059-989930978.jpg	f	super_admin	local	t	105530002151830158368
d8695881-ed27-455a-8aa2-66c0b479f119	Drashti Thakkar	drashti@york.ie	$2b$12$l7lPRSPFp2gSQ9DhbWV8wukwpZbc68oqrqYGy.S4dVmfd4.CrZyqO	Drashti Thakkar	2026-09-29 11:38:03.885	2026-09-29 11:38:03.885	\N	t	employee	local	f	\N
a49b9cf7-510b-4f86-89e7-2e49bc57cd4c	Kathan Gandhi	kathangandhi1999@gmail.com	$2b$12$rb92mA/pIO7oywgcF1ZRCu5qQzQz9e63htgTeEkaXX0hsOcNzvlgK	Kathan Gandhi	2026-09-03 05:36:56.285	2026-09-03 05:37:55.099	\N	t	employee	local	f	\N
7e2cc038-c86e-43c3-b97a-3fa9d1b5648a	Hardik Panchal	hardik@york.ie	$2b$12$xn9dHmZG2ddH/jQ2aCtgzumwcfWX2yoLMBilbkSK0zwGbtanKKvZW	Hardik Panchal	2026-09-30 06:21:12.322	2026-09-30 06:21:12.322	\N	t	employee	local	f	\N
5d58ba82-a176-4d8f-b467-11d41693497b	Dev Chauhan	dev@york.ie	$2b$12$DUQPHCGh/OznjinMZKGP5.f04l62pM/4SR5C4MNj7C/N3sQkJxa1q	Dev Chauhan	2026-09-30 06:21:23.555	2026-09-30 06:21:23.555	\N	t	employee	local	f	\N
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: chat_messages chat_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_pkey PRIMARY KEY (id);


--
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);


--
-- Name: leaves leaves_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leaves
    ADD CONSTRAINT leaves_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: user_settings user_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_settings
    ADD CONSTRAINT user_settings_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: chat_messages_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "chat_messages_createdAt_idx" ON public.chat_messages USING btree ("createdAt");


--
-- Name: chat_messages_receiverId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "chat_messages_receiverId_idx" ON public.chat_messages USING btree ("receiverId");


--
-- Name: chat_messages_receiverId_read_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "chat_messages_receiverId_read_idx" ON public.chat_messages USING btree ("receiverId", read);


--
-- Name: chat_messages_senderId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "chat_messages_senderId_idx" ON public.chat_messages USING btree ("senderId");


--
-- Name: chat_messages_senderId_receiverId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "chat_messages_senderId_receiverId_idx" ON public.chat_messages USING btree ("senderId", "receiverId");


--
-- Name: employees_userId_department_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "employees_userId_department_idx" ON public.employees USING btree ("userId", department);


--
-- Name: employees_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "employees_userId_idx" ON public.employees USING btree ("userId");


--
-- Name: employees_userId_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "employees_userId_status_idx" ON public.employees USING btree ("userId", status);


--
-- Name: leaves_employeeId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "leaves_employeeId_idx" ON public.leaves USING btree ("employeeId");


--
-- Name: leaves_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX leaves_status_idx ON public.leaves USING btree (status);


--
-- Name: leaves_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "leaves_userId_idx" ON public.leaves USING btree ("userId");


--
-- Name: notifications_userId_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "notifications_userId_createdAt_idx" ON public.notifications USING btree ("userId", "createdAt");


--
-- Name: notifications_userId_read_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "notifications_userId_read_idx" ON public.notifications USING btree ("userId", read);


--
-- Name: user_settings_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "user_settings_userId_key" ON public.user_settings USING btree ("userId");


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: users_googleId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "users_googleId_idx" ON public.users USING btree ("googleId");


--
-- Name: users_googleId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "users_googleId_key" ON public.users USING btree ("googleId");


--
-- Name: chat_messages chat_messages_receiverId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT "chat_messages_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: chat_messages chat_messages_senderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT "chat_messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: employees employees_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT "employees_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: leaves leaves_employeeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leaves
    ADD CONSTRAINT "leaves_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: leaves leaves_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leaves
    ADD CONSTRAINT "leaves_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notifications notifications_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_settings user_settings_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_settings
    ADD CONSTRAINT "user_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict 9f68IUmgLpEsj0UsoXCwVaLkhYIXlsgTuNOWYwJejCNR3D5F2ce10oFcUPHtvdy

