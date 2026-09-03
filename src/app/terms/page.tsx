"use client";

import Link from "next/link";
import { useTranslation } from "@/i18n";

export default function TermsPage() {
  const { isZh } = useTranslation();
  return (
    <div className="min-h-[100dvh] bg-surface-50 px-6 py-16">
      <article className="max-w-2xl mx-auto card-editorial rounded-2xl p-8 space-y-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-surface-300">
          {isZh ? "法律" : "Legal"}
        </p>
        <h1 className="text-2xl font-display font-semibold">
          {isZh ? "服务条款" : "Terms of Service"}
        </h1>
        <p className="text-sm text-surface-300 leading-relaxed">
          {isZh
            ? "OfferPath 是一个求职管理工作台。您应对自己上传的内容以及对生成建议的使用方式负责，请勿上传无权处理的数据。在线支付、OAuth 与托管 AI 密钥等功能可能因部署环境而不可用。"
            : "OfferPath is provided as a job-search workspace. You are responsible for the content you upload and for how you use generated suggestions. Do not upload data you are not allowed to process. Features such as billing, OAuth, and managed AI keys may be unavailable depending on your environment."}
        </p>
        <p className="text-sm text-surface-300 leading-relaxed">
          {isZh
            ? "我们可能随产品演进调整本条款。更新后继续使用即表示您接受修订后的条款。"
            : "We may change these terms as the product evolves. Continued use after an update means you accept the revised terms."}
        </p>
        <Link href="/" className="text-sm font-medium text-brand-400 hover:text-brand-300">
          {isZh ? "← 返回 OfferPath" : "← Back to OfferPath"}
        </Link>
      </article>
    </div>
  );
}
