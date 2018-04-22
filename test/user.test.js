process.env.NODE_ENV = 'test';
const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
chai.use(chaiHttp);

const auth = require('../api/helpers/authHelpers');
const app = require('../server');
const knex = require('../db/knex');

describe('Encoding tokens', () => {
  it('should return a token', done => {
    const result = auth.genTokenRegister([1]);
    should.exist(result);
    result.should.be.a('string');
    done();
  });
});

describe('Decode a token', () => {
  it('should return a payload', done => {
    const token = auth.genToken({ id: 2, email: 'email@email.com' });
    should.exist(token);
    token.should.be.a('string');
    const payload = auth.decodeToken(token);
    payload.sub.id.should.eql(2);
    payload.sub.email.should.eql('email@email.com');
    done();
  });
});

describe('routes: userRoutes', () => {
  it('Setting up database..', done => {
    beforeEach(() => {
      return knex.migrate
        .rollback()
        .then(() => {
          return knex.migrate.latest();
        })
        .then(() => {
          return knex.seed.run();
        });
    });

    afterEach(() => {
      return knex.migrate.rollback();
    });
    done();
  });
});

describe('POST /api/v1/auth/register', () => {
  it('should register a new user', done => {
    chai
      .request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'test@example.com',
        password: 'shhhhhhh',
      })
      .end((err, res) => {
        should.not.exist(err);
        res.redirects.length.should.eql(0);
        res.status.should.eql(200);
        res.type.should.eql('application/json');
        chai.expect(res.body).to.have.property('token');
        done();
      });
  });
});

describe('POST /api/v1/auth/login', () => {
  it('should login a user', done => {
    chai
      .request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'test2@example.com',
        password: 'test123',
      })
      .end((err, res) => {
        should.not.exist(err);
        res.redirects.length.should.eql(0);
        res.status.should.eql(200);
        res.type.should.eql('application/json');
        chai.expect(res.body).to.have.property('token');
        done();
      });
  });
});

describe('POST /api/v1/auth/login', () => {
  it('should login an unregistered user', done => {
    chai
      .request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'josh@example.com',
        password: '123',
      })
      .end((err, res) => {
        should.not.exist(err);
        res.redirects.length.should.eql(0);
        res.status.should.eql(500);
        res.type.should.eql('application/json');
        chai.expect(res.body).to.have.property('error');
        res.body.error.should.eql('Error loggin in.');
        done();
      });
  });
});

describe('GET /api/v1/auth/secret', () => {
  it('should allow entry', done => {
    const token = auth.genTokenRegister([2]);

    chai
      .request(app)
      .get('/api/v1/auth/secret')
      .set('Authorization', `bearer ${token}`)
      .end((err, res) => {
        should.not.exist(err);
        res.redirects.length.should.eql(0);
        res.status.should.eql(200);
        done();
      });
  });
});

describe('GET /api/v1/auth/secret', () => {
  it('should refuse entry', done => {
    chai
      .request(app)
      .get('/api/v1/auth/secret')
      .set('Authorization', `bearer 12345`)
      .end((err, res) => {
        should.not.exist(err);
        res.redirects.length.should.eql(0);
        res.status.should.eql(401);
        done();
      });
  });
});
