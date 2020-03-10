import { ajax } from "../ajax";
import nock from "nock";
import { on } from "cluster";

describe("creator: ajax", () => {
    it("should make an ajax call using a url without error", done => {
        const scope = nock("http://example.com")
            .get("/")
            .reply(200, {
                foo: "bar"
            });

        ajax("http://example.com").once("data", data => {
            expect(data.data.foo).toEqual("bar");
            scope.done();
            done();
        });
    });

    it("should make an ajax call with a post request", done => {
        const scope = nock("http://example.com")
            .post("/")
            .reply(200, {
                foo: "bar"
            });

        ajax("http://example.com", {
            method: "post"
        }).once("data", data => {
            expect(data.data.foo).toEqual("bar");
            scope.done();
            done();
        });
    });

    it("should emit an error if the underlying post request fails", done => {
        const scope = nock("http://example.com")
            .get("/")
            .reply(404);

        ajax("http://example.com")
            .on("data", () => {})
            .on("error", err => {
                expect(err).toBeDefined();
                scope.done();
                done();
            });
    });

    it("should accept the 'text' response type", done => {
        const scope = nock("http://example.com")
            .get("/")
            .reply(200, "hello, world");

        ajax("http://example.com", { responseType: "text" }).once(
            "data",
            data => {
                expect(data.data).toEqual("hello, world");
                scope.done();
                done();
            }
        );
    });

    it("should accept the 'buffer' response type", done => {
        const scope = nock("http://example.com")
            .get("/")
            .reply(200, Buffer.from("hello, world"));

        ajax("http://example.com", { responseType: "buffer" }).once(
            "data",
            data => {
                expect(Buffer.isBuffer(data.data)).toEqual(true);
                scope.done();
                done();
            }
        );
    });
});
